import type { SupabaseClient } from '@supabase/supabase-js'
import { subDays } from 'date-fns'
import type {
  FoodDay,
  FoodEntry,
  HealthIngestPayload,
  HealthIngestResult,
  HealthSnapshot,
  Macros,
  NutritionTargets,
} from '@/app/types/health'

/**
 * Thin mapping layer between the camelCase TS model and the snake_case
 * `health_*` tables (see supabase/migrations/20260908_health_metrics.sql).
 * Nested objects (race predictions, regional DEXA, laps) are stored as jsonb
 * verbatim, so only top-level keys are converted.
 */

type SeriesKey = Exclude<keyof HealthIngestPayload, 'source'>

export const HEALTH_TABLES: Record<SeriesKey, { table: string; conflict: string }> = {
  sleep: { table: 'health_sleep', conflict: 'date' },
  vitals: { table: 'health_daily_vitals', conflict: 'date' },
  load: { table: 'health_training_load', conflict: 'date' },
  fitness: { table: 'health_fitness_assessments', conflict: 'date' },
  workouts: { table: 'health_workouts', conflict: 'id' },
  bodyProfile: { table: 'health_body_profile', conflict: 'date' },
  compositions: { table: 'health_body_composition', conflict: 'id' },
  food: { table: 'health_food_entries', conflict: 'id' },
  photos: { table: 'health_progress_photos', conflict: 'id' },
  checkins: { table: 'health_checkins', conflict: 'date' },
  phases: { table: 'health_phases', conflict: 'id' },
  focus: { table: 'health_focus_notes', conflict: 'week_start' },
}

const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())

export function toRow<T extends object>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [snake(k), v]))
}

export function fromRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v])) as T
}

const DEFAULT_TARGETS: NutritionTargets = { calories: 3000, proteinG: 180, carbsG: 340, fatG: 90 }

function groupFood(entries: FoodEntry[]): FoodDay[] {
  const byDate = new Map<string, FoodEntry[]>()
  for (const e of entries) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e])
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({
      date,
      entries: rows.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
      totals: rows.reduce<Macros>(
        (acc, e) => ({
          calories: acc.calories + (e.calories ?? 0),
          proteinG: acc.proteinG + (e.proteinG ?? 0),
          carbsG: acc.carbsG + (e.carbsG ?? 0),
          fatG: acc.fatG + (e.fatG ?? 0),
        }),
        { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      ),
    }))
}

/**
 * Reads the private warehouse into a snapshot. Returns null when the tables
 * are empty (or missing) so the caller can fall back to fixtures.
 */
export async function fetchSupabaseSnapshot(client: SupabaseClient, today = new Date()): Promise<HealthSnapshot | null> {
  const { data: phaseRows, error: phaseError } = await client.from('health_phases').select('*').order('start_date')
  if (phaseError) throw phaseError
  const phases = (phaseRows ?? []).map((r) => fromRow<HealthSnapshot['phases'][number]>(r))

  const since = phases[0]?.startDate ?? subDays(today, 120).toISOString().slice(0, 10)
  const read = async <T,>(key: SeriesKey, dateColumn = 'date'): Promise<T[]> => {
    const { data, error } = await client.from(HEALTH_TABLES[key].table).select('*').gte(dateColumn, since).order(dateColumn)
    if (error) throw error
    return (data ?? []).map((r) => fromRow<T>(r))
  }

  const [sleep, vitals, load, fitness, workouts, bodyProfile, compositions, foodEntries, photos, checkins, focus] =
    await Promise.all([
      read<HealthSnapshot['sleep'][number]>('sleep'),
      read<HealthSnapshot['vitals'][number]>('vitals'),
      read<HealthSnapshot['load'][number]>('load'),
      read<HealthSnapshot['fitness'][number]>('fitness'),
      read<HealthSnapshot['workouts'][number]>('workouts'),
      read<HealthSnapshot['bodyProfile'][number]>('bodyProfile'),
      read<HealthSnapshot['compositions'][number]>('compositions'),
      read<FoodEntry>('food'),
      read<HealthSnapshot['photos'][number]>('photos'),
      read<HealthSnapshot['checkins'][number]>('checkins'),
      read<HealthSnapshot['focus'][number]>('focus', 'week_start'),
    ])

  if (phases.length === 0 && sleep.length === 0 && bodyProfile.length === 0 && compositions.length === 0) return null

  const { data: targetRows } = await client
    .from('health_nutrition_targets')
    .select('*')
    .lte('effective_from', today.toISOString().slice(0, 10))
    .order('effective_from', { ascending: false })
    .limit(1)
  const targetRow = targetRows?.[0] ? fromRow<NutritionTargets & { effectiveFrom: string }>(targetRows[0]) : null
  const targets: NutritionTargets = targetRow
    ? { calories: targetRow.calories, proteinG: targetRow.proteinG, carbsG: targetRow.carbsG, fatG: targetRow.fatG }
    : DEFAULT_TARGETS

  return {
    generatedAt: today.toISOString(),
    source: 'supabase',
    today: today.toISOString().slice(0, 10),
    phases,
    focus,
    targets,
    sleep,
    vitals,
    load,
    fitness,
    workouts,
    bodyProfile,
    compositions,
    food: groupFood(foodEntries),
    photos,
    checkins,
  }
}

/** Upserts every series in the payload on its natural key. Service-role client required. */
export async function upsertHealthPayload(client: SupabaseClient, payload: HealthIngestPayload): Promise<HealthIngestResult> {
  const result: HealthIngestResult = { ok: true, source: payload.source, upserted: {}, errors: [] }
  const startedAt = new Date().toISOString()

  for (const key of Object.keys(HEALTH_TABLES) as SeriesKey[]) {
    const rows = payload[key]
    if (!rows || rows.length === 0) continue
    const { table, conflict } = HEALTH_TABLES[key]
    const { error } = await client
      .from(table)
      .upsert(rows.map((r) => ({ ...toRow(r), synced_at: startedAt })), { onConflict: conflict })
    if (error) {
      result.ok = false
      result.errors.push(`${table}: ${error.message}`)
    } else {
      result.upserted[key] = rows.length
    }
  }

  await client.from('health_sync_runs').insert({
    source: payload.source,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    status: result.ok ? 'ok' : 'error',
    rows_upserted: result.upserted,
    error: result.errors.length ? result.errors.join('\n') : null,
  })

  return result
}
