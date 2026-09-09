import { addDays, differenceInCalendarDays, format, getDay, parseISO, subDays } from 'date-fns'
import type {
  BodyComposition,
  BodyProfile,
  DailyVitals,
  FitnessAssessment,
  FocusNote,
  FoodDay,
  FoodEntry,
  HealthSnapshot,
  ISODate,
  LoadStatus,
  Macros,
  ProgressPhoto,
  RecompPhase,
  RecoveryStatus,
  SleepNight,
  SubjectiveCheckin,
  TrainingLoadDay,
  Workout,
} from '@/app/types/health'
import { DEXA_DAY_ZERO } from './data/dexa-2026-09-08-arc'
import { DEXA_HISTORY } from './data/dexa-history'
import { GOALS, SUPPLEMENTS } from './data/plan'

/**
 * Fixtures for the /health page.
 *
 * The body-composition baseline is real: the Day 0 DEXA from ARC South 1st on
 * 2026-09-08 (see ./data). Everything else — Coros series, food log, check-ins —
 * is generated from a fixed seed so previews are stable, and is replaced by the
 * Supabase source as each ingest lands. Coros history runs from ~9 weeks before
 * today up to today; the arc itself starts on Day 0.
 */

const BUILD_WEEKS = 16
const CUT_WEEKS = 12
/** days of Coros history to publish before today */
const PUBLISHED_HISTORY = 62
/** extra unpublished days so chronic load has a warm-up */
const WARMUP = 42

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const iso = (d: Date): ISODate => format(d, 'yyyy-MM-dd')
const round = (n: number, dp = 0) => {
  const f = 10 ** dp
  return Math.round(n * f) / f
}
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type Session = { sport: Workout['sport']; title: string; minutes: [number, number]; load: [number, number]; paceSecPerKm?: [number, number] }

const WEEKLY_PLAN: Record<number, Session | null> = {
  0: null,
  1: { sport: 'strength', title: 'Upper A · push', minutes: [58, 72], load: [62, 84] },
  2: { sport: 'strength', title: 'Lower A · squat', minutes: [60, 75], load: [70, 92] },
  3: { sport: 'run', title: 'Easy run', minutes: [40, 50], load: [68, 88], paceSecPerKm: [285, 315] },
  4: { sport: 'strength', title: 'Upper B · pull', minutes: [55, 70], load: [60, 80] },
  5: { sport: 'strength', title: 'Lower B · hinge', minutes: [60, 75], load: [72, 95] },
  6: { sport: 'run', title: 'Long run', minutes: [70, 95], load: [120, 165], paceSecPerKm: [300, 330] },
}

const MEALS: Array<{ time: string; options: Array<[string, Macros]> }> = [
  {
    time: '07:40',
    options: [
      ['Greek yogurt, blueberries, whey, granola', { calories: 640, proteinG: 58, carbsG: 68, fatG: 14 }],
      ['4 eggs, sourdough, avocado, orange', { calories: 690, proteinG: 38, carbsG: 56, fatG: 32 }],
      ['Oats, whey, banana, peanut butter', { calories: 710, proteinG: 46, carbsG: 92, fatG: 18 }],
    ],
  },
  {
    time: '12:45',
    options: [
      ['Chicken thigh bowl, jasmine rice, broccoli', { calories: 880, proteinG: 62, carbsG: 98, fatG: 24 }],
      ['Salmon, potatoes, asparagus, olive oil', { calories: 860, proteinG: 54, carbsG: 72, fatG: 36 }],
      ['Turkey chili, rice, cheddar', { calories: 820, proteinG: 60, carbsG: 84, fatG: 22 }],
    ],
  },
  {
    time: '16:15',
    options: [
      ['Cottage cheese, pineapple, rice cakes', { calories: 420, proteinG: 34, carbsG: 52, fatG: 8 }],
      ['Whey, apple, almonds', { calories: 430, proteinG: 32, carbsG: 38, fatG: 16 }],
      ['Skyr, honey, walnuts', { calories: 400, proteinG: 30, carbsG: 40, fatG: 12 }],
    ],
  },
  {
    time: '19:50',
    options: [
      ['Lean beef, sweet potato, spinach', { calories: 900, proteinG: 58, carbsG: 84, fatG: 30 }],
      ['Shrimp stir fry, noodles, bok choy', { calories: 820, proteinG: 50, carbsG: 96, fatG: 20 }],
      ['Lamb kofta, rice, cucumber yogurt', { calories: 920, proteinG: 56, carbsG: 78, fatG: 38 }],
    ],
  },
]

function recoveryStatus(pct: number): RecoveryStatus {
  if (pct >= 90) return 'full'
  if (pct >= 70) return 'good'
  if (pct >= 45) return 'partial'
  return 'low'
}

function loadStatus(ratio: number): LoadStatus {
  if (ratio < 0.8) return 'detraining'
  if (ratio < 1.0) return 'maintaining'
  if (ratio <= 1.3) return 'optimal'
  if (ratio <= 1.5) return 'high'
  return 'overreaching'
}

export function buildFixtureSnapshot(today = new Date()): HealthSnapshot {
  const rand = mulberry32(20260908)
  const noise = (amp: number) => (rand() * 2 - 1) * amp
  const between = ([lo, hi]: [number, number]) => lo + rand() * (hi - lo)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]

  const dayZero = parseISO(DEXA_DAY_ZERO.date)
  const buildEnd = addDays(dayZero, BUILD_WEEKS * 7)
  const baselineWeightKg = DEXA_DAY_ZERO.weightKg

  const phases: RecompPhase[] = [
    {
      id: 'phase-build-1',
      kind: 'build',
      label: 'Build',
      startDate: iso(dayZero),
      endDate: null,
      plannedWeeks: BUILD_WEEKS,
      goal: '+5 lb DEXA lean by Nov 8. Modest fat gain allowed; lean first. Sleep above 7h.',
    },
    {
      id: 'phase-cut-1',
      kind: 'cut',
      label: 'Cut',
      startDate: iso(buildEnd),
      endDate: null,
      plannedWeeks: CUT_WEEKS,
      goal: 'Bring body fat from 23% toward 15% while holding lean mass within 2 lb.',
    },
  ]

  const sleep: SleepNight[] = []
  const vitals: DailyVitals[] = []
  const workouts: Workout[] = []
  const bodyProfile: BodyProfile[] = []
  const food: FoodDay[] = []
  const checkins: SubjectiveCheckin[] = []
  const photos: ProgressPhoto[] = []
  const dailyLoads: number[] = []

  const start = subDays(today, PUBLISHED_HISTORY + WARMUP)
  const totalDays = PUBLISHED_HISTORY + WARMUP
  for (let k = 0; k <= totalDays; k++) {
    const d = addDays(start, k)
    const date = iso(d)
    const published = k >= WARMUP
    const sinceDayZero = differenceInCalendarDays(d, dayZero)
    // 0 before Day 0 (baseline), then ramps through the build
    const progress = clamp(Math.max(0, sinceDayZero) / (BUILD_WEEKS * 7), 0, 1)
    const dow = getDay(d)

    const plan = WEEKLY_PLAN[dow]
    // a few missed sessions in the baseline weeks; none in the last fortnight
    const skipped = rand() < 0.05 && k < totalDays - 14
    let dayLoad = 0
    if (plan && !skipped) {
      const minutes = between(plan.minutes)
      const load = between(plan.load) * (1 + progress * 0.3)
      const km = plan.paceSecPerKm ? (minutes * 60) / between(plan.paceSecPerKm) : null
      const durationSec = Math.round(minutes * 60)
      const avgHr = plan.sport === 'run' ? Math.round(140 + noise(6) + (plan.title === 'Long run' ? 6 : 0)) : Math.round(118 + noise(8))
      dayLoad = Math.round(load)
      if (published) {
        workouts.push({
          id: `wk-${date}`,
          externalId: null,
          date,
          startTime: `${date}T${plan.sport === 'run' ? '06:40' : '17:30'}:00`,
          sport: plan.sport,
          title: plan.title,
          durationSec,
          distanceM: km ? Math.round(km * 1000) : null,
          avgHr,
          maxHr: avgHr + Math.round(22 + noise(6)),
          trainingLoad: dayLoad,
          calories: Math.round(minutes * (plan.sport === 'run' ? 12 : 7.5)),
          elevationGainM: km ? Math.round(40 + rand() * 90) : null,
          avgPaceSecPerKm: km ? Math.round(durationSec / km) : null,
          notes: null,
          laps: null,
          source: 'coros',
        })
      }
    }
    dailyLoads.push(dayLoad)

    if (!published) continue

    const durationMin = Math.round(clamp(440 + noise(38) + (dow === 6 ? 25 : 0), 330, 540))
    const deep = Math.round(durationMin * (0.19 + noise(0.03)))
    const rem = Math.round(durationMin * (0.22 + noise(0.03)))
    const awake = Math.round(clamp(18 + noise(10), 4, 45))
    const light = durationMin - deep - rem - awake
    const hrv = Math.round(clamp(58 + progress * 8 + noise(6), 38, 85))
    const score = Math.round(clamp(80 + progress * 4 + noise(7) - awake / 6, 55, 96))
    sleep.push({
      date,
      score,
      durationMin,
      deepMin: deep,
      lightMin: light,
      remMin: rem,
      awakeMin: awake,
      bedtime: `${iso(subDays(d, 1))}T22:${String(Math.round(35 + noise(20)) % 60).padStart(2, '0')}:00`,
      wakeTime: `${date}T06:${String(Math.round(30 + noise(20)) % 60).padStart(2, '0')}:00`,
      hrvMs: hrv,
      avgHr: Math.round(53 + noise(3) - progress * 2),
      lowestHr: Math.round(46 + noise(3) - progress * 2),
      source: 'coros',
    })

    const restingHr = Math.round(clamp(51 - progress * 3 + noise(1.8), 42, 58))
    const recoveryPct = Math.round(clamp(58 + (score - 80) * 1.2 + (hrv - 60) * 1.1 + noise(8) - dayLoad / 10 + 14, 20, 100))
    vitals.push({
      date,
      restingHr,
      avgHr: Math.round(69 + noise(4) + dayLoad / 12),
      stressAvg: Math.round(clamp(30 + noise(9) + (dow === 1 ? 4 : 0), 8, 70)),
      stressMax: Math.round(clamp(62 + noise(14), 30, 98)),
      recoveryPct,
      recoveryStatus: recoveryStatus(recoveryPct),
      steps: Math.round(8200 + noise(2400) + (plan?.sport === 'run' ? 6000 : 0)),
      activeCalories: Math.round(520 + dayLoad * 5 + noise(80)),
      source: 'coros',
    })

    // flat around the scan weight before Day 0, then ~0.25 kg/week through the build
    bodyProfile.push({
      date,
      heightCm: DEXA_DAY_ZERO.heightCm,
      weightKg:
        sinceDayZero === 0
          ? baselineWeightKg
          : round(baselineWeightKg + Math.max(0, sinceDayZero) * (0.25 / 7) + noise(0.35) + Math.sin(k / 3.5) * 0.15, 1),
      source: 'coros',
    })

    // most Sundays the afternoon snack gets skipped, so protein lands short
    const skipSnack = dow === 0 && rand() < 0.7
    const entries: FoodEntry[] = MEALS.filter((_, idx) => !(skipSnack && idx === 2)).map((meal, idx) => {
      const [description, macros] = pick(meal.options)
      const scale = 1 + noise(0.06)
      return {
        id: `food-${date}-${idx}`,
        date,
        time: meal.time,
        description,
        rawText: null,
        source: 'chat',
        calories: Math.round(macros.calories * scale),
        proteinG: Math.round(macros.proteinG * scale),
        carbsG: Math.round(macros.carbsG * scale),
        fatG: Math.round(macros.fatG * scale),
      }
    })
    const totals = entries.reduce<Macros>(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        proteinG: acc.proteinG + e.proteinG,
        carbsG: acc.carbsG + e.carbsG,
        fatG: acc.fatG + e.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    )
    // food logging started two weeks before the scan
    if (k >= totalDays - 14) food.push({ date, entries, totals })

    const c = (base: number) => clamp(Math.round(base + noise(1.2)), 1, 5)
    checkins.push({
      date,
      note: null,
      sleepQuality: c(3.9 + (score - 80) / 10),
      energy: c(3.8 + progress * 0.4),
      mood: c(4.0),
      hunger: c(3.2 + progress * 0.5),
      cravings: c(2.4),
      digestion: c(3.9),
      soreness: c(dayLoad > 80 ? 3.4 : 2.4),
      gymPerformance: c(plan?.sport === 'strength' ? 3.9 + progress * 0.5 : 3.5),
      sexDrive: c(3.8),
    })

    // weekly photos from Day 0 onward
    if (sinceDayZero >= 0 && sinceDayZero % 7 === 0) {
      const weight = bodyProfile[bodyProfile.length - 1].weightKg
      photos.push(
        { id: `photo-${date}-front`, date, pose: 'front', url: null, weightKg: weight, note: sinceDayZero === 0 ? 'Day 0' : null },
        { id: `photo-${date}-side`, date, pose: 'side', url: null, weightKg: weight, note: null },
      )
    }
  }

  const load: TrainingLoadDay[] = []
  for (let k = WARMUP; k <= totalDays; k++) {
    const window = (n: number) => dailyLoads.slice(Math.max(0, k - n + 1), k + 1)
    const shortTerm = window(7).reduce((a, b) => a + b, 0)
    const longTerm = window(42).reduce((a, b) => a + b, 0) / 6
    const ratio = longTerm > 0 ? shortTerm / longTerm : 1
    load.push({
      date: iso(addDays(start, k)),
      dailyLoad: dailyLoads[k],
      shortTerm: Math.round(shortTerm),
      longTerm: Math.round(longTerm),
      ratio: round(ratio, 2),
      status: loadStatus(ratio),
      source: 'coros',
    })
  }

  // Coros fitness assessments roughly every four weeks, the latest on Day 0
  const fitness: FitnessAssessment[] = [56, 28, 0].map((back, n) => ({
    date: iso(subDays(dayZero, back)),
    vo2max: [51.6, 52.3, 52.9][n],
    lactateThresholdHr: [171, 172, 172][n],
    thresholdPaceSecPerKm: [262, 258, 255][n],
    fitnessIndex: [59, 61, 62][n],
    racePredictions: [
      { label: '5K', distanceKm: 5, seconds: [1218, 1202, 1190][n] },
      { label: '10K', distanceKm: 10, seconds: [2540, 2506, 2481][n] },
      { label: 'Half', distanceKm: 21.0975, seconds: [5712, 5636, 5580][n] },
      { label: 'Marathon', distanceKm: 42.195, seconds: [12310, 12140, 12020][n] },
    ],
    source: 'coros',
  }))

  const compositions: BodyComposition[] = DEXA_HISTORY

  const focus: FocusNote[] = [
    {
      weekStart: iso(dayZero),
      measured: 'Day 0 DEXA: 128.1 lb lean, 40.6 lb fat, 23.1%. Fat −14.5 lb and lean +1.3 lb since the Jun 2025 scan.',
      noticed: 'The Jun 2025 peak is reversed; body fat is back near the 2023 level with 2.9 lb less lean. Fat sits mostly in the trunk (24.8%).',
      action: 'Build starts today: 3,000 kcal, 180 g protein, four lifts and two runs a week. Creatine load this week, then 10 g/day. Re-scan on the ARC Prodigy at week 8.',
    },
  ]

  return {
    generatedAt: today.toISOString(),
    source: 'fixtures',
    today: iso(today),
    phases,
    focus,
    goals: GOALS,
    supplements: SUPPLEMENTS,
    supplementLog: [],
    targets: { calories: 3000, proteinG: 180, carbsG: 340, fatG: 90 },
    sleep,
    vitals,
    load,
    fitness,
    workouts,
    bodyProfile,
    compositions,
    food,
    photos,
    checkins,
  }
}
