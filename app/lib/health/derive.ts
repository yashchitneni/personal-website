import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import type {
  BodyComposition,
  FocusNote,
  HealthSnapshot,
  ISODate,
  MetricSummary,
  RecompPhase,
  Trend,
  WeeklyDelta,
} from '@/app/types/health'
import { fmtNumber, fmtSigned } from './format'

/* ------------------------------------------------------------------ */
/* Small numeric helpers                                               */
/* ------------------------------------------------------------------ */

export function avg(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function sum(values: Array<number | null | undefined>): number {
  return values.reduce<number>((a, b) => a + (typeof b === 'number' ? b : 0), 0)
}

export function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n))
}

export function last<T>(arr: T[]): T | null {
  return arr.length ? arr[arr.length - 1] : null
}

/** avg(last n) − avg(previous n) */
export function windowDelta(values: Array<number | null>, n = 7): number | null {
  if (values.length < n * 2) return null
  const recent = avg(values.slice(-n))
  const prior = avg(values.slice(-n * 2, -n))
  if (recent === null || prior === null) return null
  return recent - prior
}

function trendOf(delta: number | null, threshold: number): Trend {
  if (delta === null || Math.abs(delta) < threshold) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

/* ------------------------------------------------------------------ */
/* Phase / arc                                                         */
/* ------------------------------------------------------------------ */

export interface PhaseState {
  current: RecompPhase | null
  next: RecompPhase | null
  daysIn: number
  /** 1-based week within the current phase */
  week: number
  progressPct: number
}

export function getPhaseState(snapshot: HealthSnapshot): PhaseState {
  const today = parseISO(snapshot.today)
  const sorted = [...snapshot.phases].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const current =
    sorted.filter((p) => parseISO(p.startDate) <= today && (!p.endDate || parseISO(p.endDate) >= today)).pop() ??
    sorted.find((p) => parseISO(p.startDate) <= today) ??
    null
  const next = current ? sorted.find((p) => p.startDate > current.startDate) ?? null : sorted[0] ?? null
  if (!current) return { current: null, next, daysIn: 0, week: 0, progressPct: 0 }
  const daysIn = differenceInCalendarDays(today, parseISO(current.startDate))
  const plannedDays = current.plannedWeeks * 7
  return {
    current,
    next,
    daysIn,
    week: Math.floor(daysIn / 7) + 1,
    progressPct: Math.min(100, Math.round((daysIn / plannedDays) * 100)),
  }
}

export interface ArcSegment {
  phase: RecompPhase
  startPct: number
  widthPct: number
}

export interface ArcState {
  segments: ArcSegment[]
  todayPct: number
  startDate: ISODate
  endDate: ISODate
}

/** Lays the whole planned arc (build → cut) on a 0–100 axis. */
export function getArc(snapshot: HealthSnapshot): ArcState {
  const sorted = [...snapshot.phases].sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (sorted.length === 0) {
    return { segments: [], todayPct: 0, startDate: snapshot.today, endDate: snapshot.today }
  }
  const start = parseISO(sorted[0].startDate)
  const totalDays = sorted.reduce((acc, p) => acc + p.plannedWeeks * 7, 0)
  let cursor = 0
  const segments = sorted.map((phase) => {
    const days = phase.plannedWeeks * 7
    const seg = { phase, startPct: (cursor / totalDays) * 100, widthPct: (days / totalDays) * 100 }
    cursor += days
    return seg
  })
  const todayDays = differenceInCalendarDays(parseISO(snapshot.today), start)
  return {
    segments,
    todayPct: Math.max(0, Math.min(100, (todayDays / totalDays) * 100)),
    startDate: sorted[0].startDate,
    endDate: addDays(start, totalDays).toISOString().slice(0, 10),
  }
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export interface HeroNumbers {
  dayZero: BodyComposition | null
  latest: BodyComposition | null
  leanDeltaKg: number | null
  fatDeltaKg: number | null
  bodyFatDeltaPct: number | null
  weightNowKg: number | null
  weightDeltaKg: number | null
}

export function getHeroNumbers(snapshot: HealthSnapshot): HeroNumbers {
  const scans = [...snapshot.compositions].sort((a, b) => a.date.localeCompare(b.date))
  const dayZero = scans[0] ?? null
  const latest = last(scans)
  const weightNow = avg(lastN(snapshot.bodyProfile, 7).map((b) => b.weightKg))
  const weightStart = avg(snapshot.bodyProfile.slice(0, 7).map((b) => b.weightKg))
  return {
    dayZero,
    latest,
    leanDeltaKg: dayZero && latest && latest !== dayZero ? latest.leanMassKg - dayZero.leanMassKg : null,
    fatDeltaKg: dayZero && latest && latest !== dayZero ? latest.fatMassKg - dayZero.fatMassKg : null,
    bodyFatDeltaPct: dayZero && latest && latest !== dayZero ? latest.bodyFatPct - dayZero.bodyFatPct : null,
    weightNowKg: weightNow,
    weightDeltaKg: weightNow !== null && weightStart !== null ? weightNow - weightStart : null,
  }
}

/* ------------------------------------------------------------------ */
/* Metric strip                                                        */
/* ------------------------------------------------------------------ */

interface SummaryInput {
  key: string
  label: string
  unit: string
  values: Array<number | null>
  higherIsBetter: boolean
  dp?: number
  /** override the headline value (default: 7-day average) */
  value?: number | null
  delta?: number | null
  trendThreshold?: number
  format?: (v: number) => string
}

function summarize(input: SummaryInput): MetricSummary {
  const dp = input.dp ?? 0
  const value = input.value !== undefined ? input.value : avg(input.values.slice(-7))
  const delta = input.delta !== undefined ? input.delta : windowDelta(input.values, 7)
  const fmt = input.format ?? ((v: number) => fmtNumber(v, dp))
  return {
    key: input.key,
    label: input.label,
    unit: input.unit,
    value,
    display: value === null ? '—' : fmt(value),
    delta,
    deltaDisplay: delta === null ? null : fmtSigned(delta, dp),
    trend: trendOf(delta, input.trendThreshold ?? 0.5 / 10 ** dp),
    higherIsBetter: input.higherIsBetter,
    series: input.values.slice(-28),
  }
}

export function getMetricStrip(snapshot: HealthSnapshot): MetricSummary[] {
  const sleepScores = snapshot.sleep.map((s) => s.score)
  const hrv = snapshot.sleep.map((s) => s.hrvMs)
  const rhr = snapshot.vitals.map((v) => v.restingHr)
  const recovery = snapshot.vitals.map((v) => v.recoveryPct)
  const ratio = snapshot.load.map((l) => l.ratio)
  const fitness = [...snapshot.fitness].sort((a, b) => a.date.localeCompare(b.date))
  const vo2 = fitness.map((f) => f.vo2max)
  const latestVo2 = last(vo2) ?? null
  const prevVo2 = vo2.length > 1 ? vo2[vo2.length - 2] : null

  return [
    summarize({ key: 'sleep', label: 'Sleep', unit: '/100', values: sleepScores, higherIsBetter: true }),
    summarize({ key: 'hrv', label: 'Sleep HRV', unit: 'ms', values: hrv, higherIsBetter: true }),
    summarize({ key: 'rhr', label: 'Resting HR', unit: 'bpm', values: rhr, higherIsBetter: false }),
    summarize({
      key: 'recovery',
      label: 'Recovery',
      unit: '%',
      values: recovery,
      higherIsBetter: true,
      value: last(recovery) ?? null,
    }),
    summarize({
      key: 'load',
      label: 'Load',
      unit: 'ratio',
      values: ratio,
      higherIsBetter: true,
      dp: 2,
      value: last(ratio) ?? null,
      trendThreshold: 0.03,
    }),
    summarize({
      key: 'vo2',
      label: 'VO₂max',
      unit: '',
      values: vo2,
      higherIsBetter: true,
      dp: 1,
      value: latestVo2,
      delta: latestVo2 !== null && prevVo2 !== null ? latestVo2 - prevVo2 : null,
    }),
  ]
}

/* ------------------------------------------------------------------ */
/* Weekly deltas                                                       */
/* ------------------------------------------------------------------ */

export function getWeeklyDeltas(snapshot: HealthSnapshot): WeeklyDelta[] {
  const start = snapshot.phases.length
    ? [...snapshot.phases].sort((a, b) => a.startDate.localeCompare(b.startDate))[0].startDate
    : snapshot.bodyProfile[0]?.date ?? snapshot.today
  const startDate = parseISO(start)
  const weekOf = (date: ISODate) => Math.floor(differenceInCalendarDays(parseISO(date), startDate) / 7)
  const totalWeeks = weekOf(snapshot.today) + 1

  const rows: WeeklyDelta[] = []
  let prevWeight: number | null = null
  for (let w = 0; w < totalWeeks; w++) {
    const inWeek = <T extends { date: ISODate }>(rows: T[]) => rows.filter((r) => weekOf(r.date) === w)
    const weight = avg(inWeek(snapshot.bodyProfile).map((b) => b.weightKg))
    const sleep = inWeek(snapshot.sleep)
    const vitals = inWeek(snapshot.vitals)
    const food = inWeek(snapshot.food)
    rows.push({
      weekStart: addDays(startDate, w * 7).toISOString().slice(0, 10),
      weekIndex: w + 1,
      weightAvgKg: weight,
      weightDeltaKg: weight !== null && prevWeight !== null ? weight - prevWeight : null,
      sleepScoreAvg: avg(sleep.map((s) => s.score)),
      sleepDurationAvgMin: avg(sleep.map((s) => s.durationMin)),
      hrvAvgMs: avg(sleep.map((s) => s.hrvMs)),
      restingHrAvg: avg(vitals.map((v) => v.restingHr)),
      weeklyLoad: sum(inWeek(snapshot.load).map((l) => l.dailyLoad)) || null,
      sessions: inWeek(snapshot.workouts).length,
      proteinAvgG: avg(food.map((f) => f.totals.proteinG)),
      caloriesAvg: avg(food.map((f) => f.totals.calories)),
      checkinEnergyAvg: avg(inWeek(snapshot.checkins).map((c) => c.energy)),
    })
    if (weight !== null) prevWeight = weight
  }
  return rows
}

export function getLatestFocus(snapshot: HealthSnapshot): FocusNote | null {
  return last([...snapshot.focus].sort((a, b) => a.weekStart.localeCompare(b.weekStart)))
}
