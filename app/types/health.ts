/**
 * Health data model for the public /health page and the private warehouse behind it.
 *
 * Every series here is keyed by an ISO calendar date (YYYY-MM-DD) in the owner's
 * local timezone. Sources are tagged so the UI can show provenance and so the
 * ingest pipeline can upsert idempotently per (source, date | external id).
 *
 * Families:
 *  - Coros: sleep, sleep HRV, daily vitals (RHR / avg HR / stress / recovery),
 *    training load, fitness assessments, workouts, body profile
 *  - DEXA / body composition (Day 0 scan + follow-ups)
 *  - Food log (chat → structured entries)
 *  - Progress photos
 *  - Subjective check-ins (legacy biofeedback 1–5 scores)
 *  - Recomp phases + weekly focus notes (the quantify → measure → act loop)
 */

export type ISODate = string
export type ISODateTime = string

export type MetricSource = 'coros' | 'dexa' | 'inbody' | 'scale' | 'manual' | 'chat' | 'derived'

/* ------------------------------------------------------------------ */
/* Recomp arc                                                          */
/* ------------------------------------------------------------------ */

export type PhaseKind = 'build' | 'cut' | 'maintain'

export interface RecompPhase {
  id: string
  kind: PhaseKind
  label: string
  startDate: ISODate
  /** null while the phase is still running */
  endDate: ISODate | null
  plannedWeeks: number
  /** one line, e.g. "Add lean mass at ~0.25 kg/week; keep fat mass flat" */
  goal: string
}

/** Weekly authored note that closes the loop: what was measured, what it means, what changes. */
export interface FocusNote {
  weekStart: ISODate
  measured: string
  noticed: string
  action: string
}

/* ------------------------------------------------------------------ */
/* Coros                                                               */
/* ------------------------------------------------------------------ */

export interface SleepNight {
  /** the morning the sleep ended on */
  date: ISODate
  /** Coros sleep score 0–100 */
  score: number | null
  durationMin: number
  deepMin: number
  lightMin: number
  remMin: number
  awakeMin: number
  bedtime: ISODateTime | null
  wakeTime: ISODateTime | null
  /** overnight HRV (rMSSD, ms) */
  hrvMs: number | null
  avgHr: number | null
  lowestHr: number | null
  source: MetricSource
}

export type RecoveryStatus = 'full' | 'good' | 'partial' | 'low'

export interface DailyVitals {
  date: ISODate
  restingHr: number | null
  avgHr: number | null
  /** Coros stress 0–100 (daily average) */
  stressAvg: number | null
  stressMax: number | null
  /** Coros recovery 0–100 */
  recoveryPct: number | null
  recoveryStatus: RecoveryStatus | null
  steps: number | null
  activeCalories: number | null
  source: MetricSource
}

export type LoadStatus = 'detraining' | 'maintaining' | 'optimal' | 'high' | 'overreaching'

export interface TrainingLoadDay {
  date: ISODate
  /** load accrued that day (Coros Training Load, TRIMP-like) */
  dailyLoad: number
  /** 7-day acute load */
  shortTerm: number
  /** 42-day chronic load */
  longTerm: number
  /** shortTerm / longTerm */
  ratio: number
  status: LoadStatus
  source: MetricSource
}

export interface RacePrediction {
  label: string
  distanceKm: number
  seconds: number
}

export interface FitnessAssessment {
  date: ISODate
  vo2max: number | null
  lactateThresholdHr: number | null
  thresholdPaceSecPerKm: number | null
  /** Coros "Running Fitness" style index, optional */
  fitnessIndex: number | null
  racePredictions: RacePrediction[]
  source: MetricSource
}

export type Sport = 'run' | 'strength' | 'bike' | 'swim' | 'hike' | 'walk' | 'row' | 'mobility' | 'other'

export interface WorkoutLap {
  index: number
  durationSec: number
  distanceM: number | null
  avgHr: number | null
}

export interface Workout {
  id: string
  externalId: string | null
  date: ISODate
  startTime: ISODateTime
  sport: Sport
  title: string
  durationSec: number
  distanceM: number | null
  avgHr: number | null
  maxHr: number | null
  trainingLoad: number | null
  calories: number | null
  elevationGainM: number | null
  avgPaceSecPerKm: number | null
  notes: string | null
  laps: WorkoutLap[] | null
  source: MetricSource
}

export interface BodyProfile {
  date: ISODate
  heightCm: number | null
  weightKg: number
  source: MetricSource
}

/* ------------------------------------------------------------------ */
/* Body composition (DEXA and friends)                                 */
/* ------------------------------------------------------------------ */

/** One DEXA region. Reports don't always give every field, so each is nullable. */
export interface RegionalComposition {
  leanKg: number | null
  fatKg: number | null
  fatPct: number | null
}

export type DexaRegion = 'arms' | 'legs' | 'trunk' | 'android' | 'gynoid'

/** Left / right lean mass for a limb group (GE Lunar "Lean Mass Balance"). */
export interface LeanSymmetry {
  leftKg: number
  rightKg: number
}

export interface BodyComposition {
  id: string
  date: ISODate
  /** "Day 0", "Week 8" — shown as a label on the timeline */
  label: string | null
  source: Extract<MetricSource, 'dexa' | 'inbody' | 'scale'>
  /** scale weight entered at the scan */
  weightKg: number
  /** total mass measured by the scan (usually a few hundred grams under scale weight) */
  totalMassKg: number | null
  leanMassKg: number
  fatMassKg: number
  boneMassKg: number | null
  /** fat-free mass = lean + bone */
  fatFreeMassKg: number | null
  /** total body fat percentage as reported for the "Total" region */
  bodyFatPct: number
  /** tissue % lean (lean / (lean + fat)) when reported */
  tissueLeanPct: number | null
  visceralFatG: number | null
  regional: Partial<Record<DexaRegion, RegionalComposition>> | null
  /** left / right lean balance, plus the total, when reported */
  symmetry: {
    arms: LeanSymmetry
    legs: LeanSymmetry
    trunk: LeanSymmetry
    total: LeanSymmetry
  } | null
  /** android / gynoid fat ratio */
  androidGynoidRatio: number | null
  /** resting metabolic rate from the report (Harris-Benedict on GE Lunar), kcal/day */
  rmrKcal: number | null
  /** relative skeletal muscle index, kg/m² */
  rsmiKgM2: number | null
  bmi: number | null
  heightCm: number | null
  ageYears: number | null
  facility: string | null
  device: string | null
  /** facility patient / study reference; not a secret but not displayed */
  patientRef: string | null
  reportUrl: string | null
  notes: string | null
}

/* ------------------------------------------------------------------ */
/* Food                                                                */
/* ------------------------------------------------------------------ */

export interface Macros {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG?: number
}

export interface FoodEntry extends Macros {
  id: string
  date: ISODate
  time: string | null
  /** short human description, e.g. "Greek yogurt, berries, whey" */
  description: string
  /** the original chat message this was parsed from */
  rawText: string | null
  source: Extract<MetricSource, 'chat' | 'manual'>
}

export interface FoodDay {
  date: ISODate
  entries: FoodEntry[]
  totals: Macros
}

export type NutritionTargets = Macros

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export type PhotoPose = 'front' | 'side' | 'back'

export interface ProgressPhoto {
  id: string
  date: ISODate
  pose: PhotoPose
  /** null until the image is uploaded; UI renders a placeholder tile */
  url: string | null
  weightKg: number | null
  note: string | null
}

/* ------------------------------------------------------------------ */
/* Subjective check-ins (legacy biofeedback)                           */
/* ------------------------------------------------------------------ */

export type CheckinKey =
  | 'sleepQuality'
  | 'energy'
  | 'mood'
  | 'hunger'
  | 'cravings'
  | 'digestion'
  | 'soreness'
  | 'gymPerformance'
  | 'sexDrive'

/** 1–5 self-report scores, one row per day */
export type SubjectiveCheckin = {
  date: ISODate
  note: string | null
} & Record<CheckinKey, number | null>

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

export interface WeeklyDelta {
  weekStart: ISODate
  /** 1 = the week starting on Day 0; ≤ 0 = baseline weeks before the arc */
  weekIndex: number
  baseline: boolean
  weightAvgKg: number | null
  weightDeltaKg: number | null
  sleepScoreAvg: number | null
  sleepDurationAvgMin: number | null
  hrvAvgMs: number | null
  restingHrAvg: number | null
  weeklyLoad: number | null
  sessions: number
  proteinAvgG: number | null
  caloriesAvg: number | null
  checkinEnergyAvg: number | null
}

export type Trend = 'up' | 'down' | 'flat'

export interface MetricSummary {
  key: string
  label: string
  value: number | null
  unit: string
  /** formatted value for display */
  display: string
  /** 7-day change vs the previous 7 days */
  delta: number | null
  deltaDisplay: string | null
  trend: Trend
  /** whether "up" is good for this metric */
  higherIsBetter: boolean
  /** last ~28 points for the sparkline */
  series: Array<number | null>
}

/* ------------------------------------------------------------------ */
/* Snapshot                                                            */
/* ------------------------------------------------------------------ */

export type SnapshotSource = 'fixtures' | 'supabase'

export interface HealthSnapshot {
  generatedAt: ISODateTime
  source: SnapshotSource
  today: ISODate
  phases: RecompPhase[]
  focus: FocusNote[]
  targets: NutritionTargets
  sleep: SleepNight[]
  vitals: DailyVitals[]
  load: TrainingLoadDay[]
  fitness: FitnessAssessment[]
  workouts: Workout[]
  bodyProfile: BodyProfile[]
  compositions: BodyComposition[]
  food: FoodDay[]
  photos: ProgressPhoto[]
  checkins: SubjectiveCheckin[]
}

/* ------------------------------------------------------------------ */
/* Ingest API contract                                                 */
/* ------------------------------------------------------------------ */

/**
 * Body accepted by POST /api/health/ingest. Any subset of series may be sent;
 * rows are upserted on their natural key (see migration). Used by the private
 * Coros sync job, the food-logging chat hook, and manual DEXA entry.
 */
export interface HealthIngestPayload {
  source: MetricSource
  sleep?: SleepNight[]
  vitals?: DailyVitals[]
  load?: TrainingLoadDay[]
  fitness?: FitnessAssessment[]
  workouts?: Workout[]
  bodyProfile?: BodyProfile[]
  compositions?: BodyComposition[]
  food?: FoodEntry[]
  photos?: ProgressPhoto[]
  checkins?: SubjectiveCheckin[]
  phases?: RecompPhase[]
  focus?: FocusNote[]
}

export interface HealthIngestResult {
  ok: boolean
  source: MetricSource
  upserted: Partial<Record<keyof Omit<HealthIngestPayload, 'source'>, number>>
  errors: string[]
}
