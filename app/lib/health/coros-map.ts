import type {
  BodyProfile,
  DailyVitals,
  FitnessAssessment,
  HealthIngestPayload,
  ISODate,
  RacePrediction,
  SleepNight,
  Sport,
  TrainingLoadDay,
  Workout,
  WorkoutLap,
} from '@/app/types/health'
import { loadStatusFromRatio, recoveryStatusFromPct } from './status'

/**
 * Coros series posted by Work Ops to POST /api/health/ingest.
 * Keys match HEALTH_TABLES in ./supabase.ts.
 */
export const COROS_SERIES = ['sleep', 'vitals', 'load', 'workouts', 'fitness', 'bodyProfile'] as const
export type CorosSeriesKey = (typeof COROS_SERIES)[number]

export const SPORT_VALUES = ['run', 'strength', 'bike', 'swim', 'hike', 'walk', 'row', 'mobility', 'other'] as const
export const RECOVERY_VALUES = ['full', 'good', 'partial', 'low'] as const
export const LOAD_STATUS_VALUES = ['detraining', 'maintaining', 'optimal', 'high', 'overreaching'] as const

/**
 * Typical Coros Training Hub / MCP sportType numbers → our Sport enum.
 * Confirm against the live tool schema; unknown values become `other`.
 * 100-series = run variants, 200-series = bike, etc.
 */
const SPORT_BY_NUMBER: Record<number, Sport> = {
  100: 'run',
  101: 'run',
  102: 'run',
  103: 'run',
  200: 'bike',
  201: 'bike',
  202: 'bike',
  300: 'swim',
  301: 'swim',
  400: 'walk',
  401: 'hike',
  402: 'hike',
  500: 'row',
  600: 'strength',
  601: 'strength',
  602: 'mobility',
}

const SPORT_BY_NAME: Record<string, Sport> = {
  run: 'run',
  running: 'run',
  trail: 'run',
  trailrun: 'run',
  treadmill: 'run',
  indoorrun: 'run',
  strength: 'strength',
  gym: 'strength',
  weight: 'strength',
  weightlifting: 'strength',
  bike: 'bike',
  cycling: 'bike',
  indoorcycling: 'bike',
  swim: 'swim',
  swimming: 'swim',
  hike: 'hike',
  hiking: 'hike',
  walk: 'walk',
  walking: 'walk',
  row: 'row',
  rowing: 'row',
  yoga: 'mobility',
  stretch: 'mobility',
  mobility: 'mobility',
  other: 'other',
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function firstDefined(...values: unknown[]): unknown {
  return values.find((v) => v !== undefined && v !== null && v !== '')
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

/** YYYY-MM-DD, YYYYMMDD, or a Date / ISO datetime. Dates are the owner's local calendar day. */
export function toISODate(value: unknown): ISODate | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const s = asString(value)
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
  return null
}

/** ISO datetime, epoch seconds, or Coros centi-scaled epoch (13-digit). */
export function toISODateTime(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  const s = asString(value)
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s
  const n = asNumber(value)
  if (n === null) return null
  if (n > 1e12) return new Date(n).toISOString()
  if (n > 1e11) return new Date(n * 10).toISOString() // centi-seconds → ms
  if (n > 1e9) return new Date(n * 1000).toISOString()
  return null
}

function pickDate(raw: Record<string, unknown>, ...keys: string[]): ISODate | null {
  for (const key of keys) {
    const date = toISODate(raw[key])
    if (date) return date
  }
  return null
}

function pickNumber(raw: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const n = asNumber(raw[key])
    if (n !== null) return n
  }
  return null
}

function pickInt(raw: Record<string, unknown>, ...keys: string[]): number | null {
  const n = pickNumber(raw, ...keys)
  return n === null ? null : Math.round(n)
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const s = asString(raw[key])
    if (s) return s
  }
  return null
}

/**
 * Duration → minutes. Prefers an explicit *Min field; otherwise treats
 * *Sec / `duration` / `totalSleepTime` as seconds (Coros convention).
 */
function pickMinutes(raw: Record<string, unknown>, minKeys: string[], secKeys: string[]): number | null {
  const namedMin = pickNumber(raw, ...minKeys)
  if (namedMin !== null) return Math.round(namedMin)
  const sec = pickNumber(raw, ...secKeys)
  if (sec !== null) return Math.round(sec / 60)
  return null
}

export function mapSport(raw: unknown): Sport {
  if (typeof raw === 'number' && SPORT_BY_NUMBER[raw]) return SPORT_BY_NUMBER[raw]
  const s = asString(raw)
  if (!s) return 'other'
  if ((SPORT_VALUES as readonly string[]).includes(s)) return s as Sport
  const n = Number(s)
  if (Number.isFinite(n) && SPORT_BY_NUMBER[n]) return SPORT_BY_NUMBER[n]
  const compact = s.toLowerCase().replace(/[\s_-]+/g, '')
  return SPORT_BY_NAME[compact] ?? 'other'
}

/* ------------------------------------------------------------------ */
/* Typed builders — call these once Work Ops has extracted fields      */
/* ------------------------------------------------------------------ */

export function sleepNight(row: {
  date: ISODate
  durationMin: number
  score?: number | null
  deepMin?: number | null
  lightMin?: number | null
  remMin?: number | null
  awakeMin?: number | null
  bedtime?: string | null
  wakeTime?: string | null
  hrvMs?: number | null
  avgHr?: number | null
  lowestHr?: number | null
}): SleepNight {
  return {
    date: row.date,
    score: row.score ?? null,
    durationMin: Math.round(row.durationMin),
    deepMin: Math.round(row.deepMin ?? 0),
    lightMin: Math.round(row.lightMin ?? 0),
    remMin: Math.round(row.remMin ?? 0),
    awakeMin: Math.round(row.awakeMin ?? 0),
    bedtime: row.bedtime ?? null,
    wakeTime: row.wakeTime ?? null,
    hrvMs: row.hrvMs ?? null,
    avgHr: row.avgHr ?? null,
    lowestHr: row.lowestHr ?? null,
    source: 'coros',
  }
}

export function dailyVitals(row: {
  date: ISODate
  restingHr?: number | null
  avgHr?: number | null
  stressAvg?: number | null
  stressMax?: number | null
  recoveryPct?: number | null
  recoveryStatus?: DailyVitals['recoveryStatus']
  steps?: number | null
  activeCalories?: number | null
}): DailyVitals {
  const recoveryPct = row.recoveryPct ?? null
  return {
    date: row.date,
    restingHr: row.restingHr ?? null,
    avgHr: row.avgHr ?? null,
    stressAvg: row.stressAvg ?? null,
    stressMax: row.stressMax ?? null,
    recoveryPct,
    recoveryStatus: row.recoveryStatus ?? (recoveryPct !== null ? recoveryStatusFromPct(recoveryPct) : null),
    steps: row.steps ?? null,
    activeCalories: row.activeCalories ?? null,
    source: 'coros',
  }
}

export function trainingLoadDay(row: {
  date: ISODate
  dailyLoad: number
  shortTerm: number
  longTerm: number
  ratio?: number | null
  status?: TrainingLoadDay['status']
}): TrainingLoadDay {
  const ratio = row.ratio ?? (row.longTerm > 0 ? row.shortTerm / row.longTerm : 1)
  return {
    date: row.date,
    dailyLoad: Math.round(row.dailyLoad),
    shortTerm: Math.round(row.shortTerm),
    longTerm: Math.round(row.longTerm),
    ratio: Math.round(ratio * 100) / 100,
    status: row.status ?? loadStatusFromRatio(ratio),
    source: 'coros',
  }
}

export function fitnessAssessment(row: {
  date: ISODate
  vo2max?: number | null
  lactateThresholdHr?: number | null
  thresholdPaceSecPerKm?: number | null
  fitnessIndex?: number | null
  racePredictions?: RacePrediction[] | null
}): FitnessAssessment {
  return {
    date: row.date,
    vo2max: row.vo2max ?? null,
    lactateThresholdHr: row.lactateThresholdHr ?? null,
    thresholdPaceSecPerKm: row.thresholdPaceSecPerKm ?? null,
    fitnessIndex: row.fitnessIndex ?? null,
    racePredictions: row.racePredictions ?? [],
    source: 'coros',
  }
}

export function workout(row: {
  id: string
  date: ISODate
  startTime: string
  sport: Sport
  title: string
  durationSec: number
  externalId?: string | null
  distanceM?: number | null
  avgHr?: number | null
  maxHr?: number | null
  trainingLoad?: number | null
  calories?: number | null
  elevationGainM?: number | null
  avgPaceSecPerKm?: number | null
  notes?: string | null
  laps?: WorkoutLap[] | null
}): Workout {
  return {
    id: row.id,
    externalId: row.externalId ?? null,
    date: row.date,
    startTime: row.startTime,
    sport: row.sport,
    title: row.title,
    durationSec: Math.round(row.durationSec),
    distanceM: row.distanceM ?? null,
    avgHr: row.avgHr ?? null,
    maxHr: row.maxHr ?? null,
    trainingLoad: row.trainingLoad ?? null,
    calories: row.calories ?? null,
    elevationGainM: row.elevationGainM ?? null,
    avgPaceSecPerKm: row.avgPaceSecPerKm ?? null,
    notes: row.notes ?? null,
    laps: row.laps ?? null,
    source: 'coros',
  }
}

export function bodyProfile(row: { date: ISODate; weightKg: number; heightCm?: number | null }): BodyProfile {
  return {
    date: row.date,
    heightCm: row.heightCm ?? null,
    weightKg: row.weightKg,
    source: 'coros',
  }
}

/* ------------------------------------------------------------------ */
/* Best-effort alias layer — confirm field names against live MCP     */
/* ------------------------------------------------------------------ */

export function fromCorosSleep(raw: Record<string, unknown>): SleepNight {
  const date = pickDate(raw, 'date', 'happenDay', 'happen_day', 'sleepDate', 'sleep_date', 'wakeDate')
  const durationMin = pickMinutes(
    raw,
    ['durationMin', 'duration_min', 'totalSleepMin', 'sleepMin'],
    ['durationSec', 'duration_sec', 'duration', 'totalSleepTime', 'sleepTime', 'totalSleep'],
  )
  if (!date || durationMin === null) {
    throw new Error('fromCorosSleep: need a date (or happenDay) and a duration')
  }
  const deepMin = pickMinutes(raw, ['deepMin', 'deep_min'], ['deepSec', 'deepSleep', 'deepSleepTime', 'deep']) ?? 0
  const remMin = pickMinutes(raw, ['remMin', 'rem_min'], ['remSec', 'remSleep', 'remSleepTime', 'rem']) ?? 0
  const awakeMin = pickMinutes(raw, ['awakeMin', 'awake_min'], ['awakeSec', 'awakeTime', 'awake']) ?? 0
  const lightNamed = pickMinutes(raw, ['lightMin', 'light_min'], ['lightSec', 'lightSleep', 'lightSleepTime', 'light'])
  const lightMin = lightNamed ?? Math.max(0, durationMin - deepMin - remMin - awakeMin)
  return sleepNight({
    date,
    durationMin,
    score: pickInt(raw, 'score', 'sleepScore', 'sleep_score', 'quality'),
    deepMin,
    lightMin,
    remMin,
    awakeMin,
    bedtime: toISODateTime(firstDefined(raw.bedtime, raw.sleepStart, raw.startTime, raw.fallAsleepTime)),
    wakeTime: toISODateTime(firstDefined(raw.wakeTime, raw.wake_time, raw.sleepEnd, raw.endTime)),
    hrvMs: pickInt(raw, 'hrvMs', 'hrv_ms', 'avgSleepHrv', 'sleepHrv', 'hrv', 'rmssd'),
    avgHr: pickInt(raw, 'avgHr', 'avg_hr', 'averageHr', 'sleepAvgHr'),
    lowestHr: pickInt(raw, 'lowestHr', 'lowest_hr', 'minHr', 'lowestHeartRate'),
  })
}

export function fromCorosVitals(raw: Record<string, unknown>): DailyVitals {
  const date = pickDate(raw, 'date', 'happenDay', 'happen_day', 'day')
  if (!date) throw new Error('fromCorosVitals: need a date (or happenDay)')
  const recoveryPct = pickInt(raw, 'recoveryPct', 'recovery_pct', 'recovery', 'recoveryScore', 'readiness')
  const statusRaw = pickString(raw, 'recoveryStatus', 'recovery_status')
  const recoveryStatus =
    statusRaw && (RECOVERY_VALUES as readonly string[]).includes(statusRaw)
      ? (statusRaw as DailyVitals['recoveryStatus'])
      : undefined
  return dailyVitals({
    date,
    restingHr: pickInt(raw, 'restingHr', 'resting_hr', 'rhr', 'restHr', 'restingHeartRate'),
    avgHr: pickInt(raw, 'avgHr', 'avg_hr', 'averageHr', 'avgHeartRate'),
    stressAvg: pickInt(raw, 'stressAvg', 'stress_avg', 'avgStress', 'stress'),
    stressMax: pickInt(raw, 'stressMax', 'stress_max', 'maxStress'),
    recoveryPct,
    recoveryStatus,
    steps: pickInt(raw, 'steps', 'step', 'stepCount'),
    activeCalories: pickInt(raw, 'activeCalories', 'active_calories', 'calories', 'calorie', 'activeCal'),
  })
}

export function fromCorosLoad(raw: Record<string, unknown>): TrainingLoadDay {
  const date = pickDate(raw, 'date', 'happenDay', 'happen_day', 'day')
  const dailyLoad = pickNumber(raw, 'dailyLoad', 'daily_load', 'trainingLoad', 'tl', 'load')
  if (!date || dailyLoad === null) throw new Error('fromCorosLoad: need a date and dailyLoad / trainingLoad')
  const shortTerm = pickNumber(raw, 'shortTerm', 'short_term', 'acute', 't7d', 'atl', 'acuteLoad') ?? dailyLoad
  const longTerm = pickNumber(raw, 'longTerm', 'long_term', 'chronic', 't42d', 'ctl', 'chronicLoad') ?? shortTerm
  const ratio = pickNumber(raw, 'ratio', 'loadRatio', 'acwr')
  const statusRaw = pickString(raw, 'status', 'loadStatus')
  const status =
    statusRaw && (LOAD_STATUS_VALUES as readonly string[]).includes(statusRaw)
      ? (statusRaw as TrainingLoadDay['status'])
      : undefined
  return trainingLoadDay({ date, dailyLoad, shortTerm, longTerm, ratio, status })
}

function racePrediction(raw: unknown): RacePrediction | null {
  if (!isRecord(raw)) return null
  const label = pickString(raw, 'label', 'name', 'distanceName')
  const distanceKm = pickNumber(raw, 'distanceKm', 'distance_km', 'distance', 'km')
  const seconds = pickNumber(raw, 'seconds', 'time', 'predictTime', 'duration')
  if (!label || distanceKm === null || seconds === null) return null
  return { label, distanceKm, seconds: Math.round(seconds) }
}

export function fromCorosFitness(raw: Record<string, unknown>): FitnessAssessment {
  const date = pickDate(raw, 'date', 'happenDay', 'happen_day', 'assessDate')
  if (!date) throw new Error('fromCorosFitness: need a date')
  const predictions = raw.racePredictions ?? raw.race_predictions ?? raw.predictions
  const racePredictions = Array.isArray(predictions)
    ? predictions.map(racePrediction).filter((p): p is RacePrediction => p !== null)
    : []
  return fitnessAssessment({
    date,
    vo2max: pickNumber(raw, 'vo2max', 'vo2Max', 'vo2_max'),
    lactateThresholdHr: pickInt(raw, 'lactateThresholdHr', 'lactate_threshold_hr', 'ltHr', 'thresholdHr'),
    thresholdPaceSecPerKm: pickInt(raw, 'thresholdPaceSecPerKm', 'threshold_pace_sec_per_km', 'ltPace', 'thresholdPace'),
    fitnessIndex: pickInt(raw, 'fitnessIndex', 'fitness_index', 't28d', 'baseFitness', 'runningFitness'),
    racePredictions,
  })
}

function workoutLap(raw: unknown, index: number): WorkoutLap | null {
  if (!isRecord(raw)) return null
  const durationSec = pickNumber(raw, 'durationSec', 'duration_sec', 'duration', 'time')
  if (durationSec === null) return null
  return {
    index: pickInt(raw, 'index', 'lapIndex') ?? index,
    durationSec: Math.round(durationSec),
    distanceM: pickInt(raw, 'distanceM', 'distance_m', 'distance'),
    avgHr: pickInt(raw, 'avgHr', 'avg_hr', 'averageHr'),
  }
}

export function fromCorosWorkout(raw: Record<string, unknown>): Workout {
  const date =
    pickDate(raw, 'date', 'happenDay', 'happen_day', 'startDate') ??
    toISODate(firstDefined(raw.startTime, raw.start_time, raw.beginTime))
  const startTime =
    toISODateTime(firstDefined(raw.startTime, raw.start_time, raw.beginTime, raw.startTimestamp)) ??
    (date ? `${date}T00:00:00` : null)
  const durationSec =
    pickInt(raw, 'durationSec', 'duration_sec') ??
    (pickNumber(raw, 'durationMin', 'duration_min') !== null
      ? Math.round(pickNumber(raw, 'durationMin', 'duration_min')! * 60)
      : pickInt(raw, 'duration', 'totalTime', 'workoutTime', 'movingTime'))
  if (!date || !startTime || durationSec === null) {
    throw new Error('fromCorosWorkout: need date, startTime, and durationSec')
  }
  const externalId = pickString(raw, 'externalId', 'external_id', 'labelId', 'sportLabelId', 'activityId', 'id')
  const id = pickString(raw, 'id') ?? (externalId ? `coros-${externalId}` : `coros-${date}-${startTime}`)
  const sport = mapSport(firstDefined(raw.sport, raw.sportType, raw.sport_type, raw.mode, raw.sportName))
  const title = pickString(raw, 'title', 'name', 'sportName', 'workoutName') ?? sport
  const lapsRaw = raw.laps ?? raw.lapList
  const laps = Array.isArray(lapsRaw)
    ? lapsRaw.map((lap, i) => workoutLap(lap, i)).filter((l): l is WorkoutLap => l !== null)
    : null
  const distanceM = pickInt(raw, 'distanceM', 'distance_m', 'distance')
  const avgPace =
    pickInt(raw, 'avgPaceSecPerKm', 'avg_pace_sec_per_km', 'avgPace', 'avgSpeed') ??
    (distanceM && distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : null)
  return workout({
    id,
    externalId,
    date,
    startTime,
    sport,
    title,
    durationSec,
    distanceM,
    avgHr: pickInt(raw, 'avgHr', 'avg_hr', 'averageHr'),
    maxHr: pickInt(raw, 'maxHr', 'max_hr', 'maxHeartRate'),
    trainingLoad: pickInt(raw, 'trainingLoad', 'training_load', 'tl', 'load'),
    calories: pickInt(raw, 'calories', 'calorie', 'cal'),
    elevationGainM: pickInt(raw, 'elevationGainM', 'elevation_gain_m', 'elevationGain', 'ascent', 'climb'),
    avgPaceSecPerKm: avgPace,
    notes: pickString(raw, 'notes', 'note', 'sportNote'),
    laps: laps && laps.length ? laps : null,
  })
}

export function fromCorosBodyProfile(raw: Record<string, unknown>): BodyProfile {
  const date = pickDate(raw, 'date', 'happenDay', 'happen_day', 'day')
  const weightKg = pickNumber(raw, 'weightKg', 'weight_kg', 'weight')
  if (!date || weightKg === null) throw new Error('fromCorosBodyProfile: need a date and weightKg')
  return bodyProfile({
    date,
    weightKg,
    heightCm: pickNumber(raw, 'heightCm', 'height_cm', 'height'),
  })
}

export function buildCorosIngestPayload(parts: {
  sleep?: Array<Record<string, unknown> | SleepNight>
  vitals?: Array<Record<string, unknown> | DailyVitals>
  load?: Array<Record<string, unknown> | TrainingLoadDay>
  workouts?: Array<Record<string, unknown> | Workout>
  fitness?: Array<Record<string, unknown> | FitnessAssessment>
  bodyProfile?: Array<Record<string, unknown> | BodyProfile>
}): HealthIngestPayload {
  const raw = (row: object): Record<string, unknown> => row as Record<string, unknown>
  const alreadyTyped = (row: object, key: string) => key in row && 'source' in row
  return {
    source: 'coros',
    sleep: parts.sleep?.map((row) => (alreadyTyped(row, 'durationMin') ? (row as SleepNight) : fromCorosSleep(raw(row)))),
    vitals: parts.vitals?.map((row) => (alreadyTyped(row, 'restingHr') || alreadyTyped(row, 'steps') ? (row as DailyVitals) : fromCorosVitals(raw(row)))),
    load: parts.load?.map((row) => (alreadyTyped(row, 'dailyLoad') ? (row as TrainingLoadDay) : fromCorosLoad(raw(row)))),
    workouts: parts.workouts?.map((row) => (alreadyTyped(row, 'durationSec') && alreadyTyped(row, 'id') ? (row as Workout) : fromCorosWorkout(raw(row)))),
    fitness: parts.fitness?.map((row) => (alreadyTyped(row, 'racePredictions') || alreadyTyped(row, 'vo2max') ? (row as FitnessAssessment) : fromCorosFitness(raw(row)))),
    bodyProfile: parts.bodyProfile?.map((row) => (alreadyTyped(row, 'weightKg') ? (row as BodyProfile) : fromCorosBodyProfile(raw(row)))),
  }
}

export function exampleCorosPayload(): HealthIngestPayload {
  return {
    source: 'coros',
    sleep: [
      sleepNight({
        date: '2026-09-08',
        score: 84,
        durationMin: 452,
        deepMin: 86,
        lightMin: 248,
        remMin: 98,
        awakeMin: 20,
        bedtime: '2026-09-07T22:41:00',
        wakeTime: '2026-09-08T06:13:00',
        hrvMs: 62,
        avgHr: 51,
        lowestHr: 46,
      }),
    ],
    vitals: [
      dailyVitals({
        date: '2026-09-08',
        restingHr: 48,
        avgHr: 71,
        stressAvg: 28,
        stressMax: 64,
        recoveryPct: 78,
        steps: 10420,
        activeCalories: 640,
      }),
    ],
    load: [trainingLoadDay({ date: '2026-09-08', dailyLoad: 82, shortTerm: 510, longTerm: 470 })],
    workouts: [
      workout({
        id: 'coros-example-2026-09-08-run',
        externalId: 'example-label-1',
        date: '2026-09-08',
        startTime: '2026-09-08T06:40:00',
        sport: 'run',
        title: 'Easy run',
        durationSec: 2700,
        distanceM: 8500,
        avgHr: 142,
        maxHr: 161,
        trainingLoad: 82,
        calories: 540,
        elevationGainM: 48,
        avgPaceSecPerKm: 318,
      }),
    ],
    fitness: [
      fitnessAssessment({
        date: '2026-09-08',
        vo2max: 52.9,
        lactateThresholdHr: 172,
        thresholdPaceSecPerKm: 255,
        fitnessIndex: 62,
        racePredictions: [
          { label: '5K', distanceKm: 5, seconds: 1190 },
          { label: '10K', distanceKm: 10, seconds: 2481 },
          { label: 'Half', distanceKm: 21.0975, seconds: 5580 },
          { label: 'Marathon', distanceKm: 42.195, seconds: 12020 },
        ],
      }),
    ],
    bodyProfile: [bodyProfile({ date: '2026-09-08', weightKg: 80.0, heightCm: 177.8 })],
  }
}

export function validateCorosPayload(payload: HealthIngestPayload): string[] {
  const errors: string[] = []
  if (payload.source !== 'coros') errors.push('source must be "coros"')
  for (const night of payload.sleep ?? []) {
    if (!night.date || night.durationMin == null) errors.push(`sleep ${night.date ?? '?'}: date and durationMin required`)
  }
  for (const day of payload.vitals ?? []) {
    if (!day.date) errors.push('vitals: date required')
  }
  for (const day of payload.load ?? []) {
    if (!day.date || day.dailyLoad == null) errors.push(`load ${day.date ?? '?'}: date and dailyLoad required`)
  }
  for (const row of payload.fitness ?? []) {
    if (!row.date) errors.push('fitness: date required')
  }
  for (const row of payload.workouts ?? []) {
    if (!row.id || !row.date || !row.startTime || !row.sport || !row.title || row.durationSec == null) {
      errors.push(`workout ${row.id ?? row.date ?? '?'}: id, date, startTime, sport, title, durationSec required`)
    }
    if (row.sport && !(SPORT_VALUES as readonly string[]).includes(row.sport)) {
      errors.push(`workout ${row.id}: invalid sport ${row.sport}`)
    }
  }
  for (const row of payload.bodyProfile ?? []) {
    if (!row.date || row.weightKg == null) errors.push(`bodyProfile ${row.date ?? '?'}: date and weightKg required`)
  }
  return errors
}
