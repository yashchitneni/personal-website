import { addDays, format, getDay, subDays } from 'date-fns'
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

/**
 * Deterministic fixtures for the /health page. Everything is generated from a
 * fixed seed relative to `today`, so previews are stable and look like a real
 * 9-week build phase with one follow-up DEXA. Replace with the Supabase source
 * once the Coros / food / DEXA sync lands.
 */

const DAY_ZERO_OFFSET = 62
const BUILD_WEEKS = 16
const CUT_WEEKS = 12

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

  const dayZero = subDays(today, DAY_ZERO_OFFSET)
  const buildEnd = addDays(dayZero, BUILD_WEEKS * 7)

  const phases: RecompPhase[] = [
    {
      id: 'phase-build-1',
      kind: 'build',
      label: 'Build',
      startDate: iso(dayZero),
      endDate: null,
      plannedWeeks: BUILD_WEEKS,
      goal: 'Add lean mass at ~0.25 kg/week. Keep fat mass flat, sleep above 7h.',
    },
    {
      id: 'phase-cut-1',
      kind: 'cut',
      label: 'Cut',
      startDate: iso(buildEnd),
      endDate: null,
      plannedWeeks: CUT_WEEKS,
      goal: 'Drop fat mass to ~10% while holding lean mass within 1 kg.',
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

  // Walk from 42 days before Day 0 so chronic load has history, but only
  // publish series from Day 0 onward.
  const HISTORY = 42
  for (let i = -HISTORY; i <= DAY_ZERO_OFFSET; i++) {
    const d = addDays(dayZero, i)
    const date = iso(d)
    const progress = Math.max(0, i) / DAY_ZERO_OFFSET
    const dow = getDay(d)

    const plan = WEEKLY_PLAN[dow]
    // a few missed sessions early on, but keep the recent fortnight complete
    const skipped = rand() < 0.05 && i < DAY_ZERO_OFFSET - 14
    let dayLoad = 0
    if (plan && !skipped) {
      const minutes = between(plan.minutes)
      // progressive overload through the build: acute load runs ahead of chronic
      const load = between(plan.load) * (1 + progress * 0.3)
      const km = plan.paceSecPerKm ? (minutes * 60) / between(plan.paceSecPerKm) : null
      const durationSec = Math.round(minutes * 60)
      const avgHr = plan.sport === 'run' ? Math.round(138 + noise(6) + (plan.title === 'Long run' ? 6 : 0)) : Math.round(118 + noise(8))
      dayLoad = Math.round(load)
      if (i >= 0) {
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
          calories: Math.round(minutes * (plan.sport === 'run' ? 11.5 : 7.2)),
          elevationGainM: km ? Math.round(40 + rand() * 90) : null,
          avgPaceSecPerKm: km ? Math.round(durationSec / km) : null,
          notes: null,
          laps: null,
          source: 'coros',
        })
      }
    }
    dailyLoads.push(dayLoad)

    if (i < 0) continue

    const durationMin = Math.round(clamp(445 + noise(38) + (dow === 6 ? 25 : 0), 330, 540))
    const deep = Math.round(durationMin * (0.19 + noise(0.03)))
    const rem = Math.round(durationMin * (0.22 + noise(0.03)))
    const awake = Math.round(clamp(18 + noise(10), 4, 45))
    const light = durationMin - deep - rem - awake
    const hrv = Math.round(clamp(57 + progress * 7 + noise(6), 38, 85))
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
      avgHr: Math.round(52 + noise(3) - progress * 2),
      lowestHr: Math.round(45 + noise(3) - progress * 2),
      source: 'coros',
    })

    const restingHr = Math.round(clamp(50.5 - progress * 3 + noise(1.8), 42, 58))
    const recoveryPct = Math.round(clamp(58 + (score - 80) * 1.2 + (hrv - 60) * 1.1 + noise(8) - dayLoad / 10 + 14, 20, 100))
    vitals.push({
      date,
      restingHr,
      avgHr: Math.round(68 + noise(4) + dayLoad / 12),
      stressAvg: Math.round(clamp(30 + noise(9) + (dow === 1 ? 4 : 0), 8, 70)),
      stressMax: Math.round(clamp(62 + noise(14), 30, 98)),
      recoveryPct,
      recoveryStatus: recoveryStatus(recoveryPct),
      steps: Math.round(8200 + noise(2400) + (plan?.sport === 'run' ? 6000 : 0)),
      activeCalories: Math.round(520 + dayLoad * 5 + noise(80)),
      source: 'coros',
    })

    bodyProfile.push({
      date,
      heightCm: 178,
      weightKg: round(76.0 + progress * 2.1 + noise(0.35) + Math.sin(i / 3.5) * 0.15, 1),
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
    food.push({ date, entries, totals })

    const c = (base: number) => clamp(Math.round(base + noise(1.2)), 1, 5)
    const checkin: SubjectiveCheckin = {
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
    }
    checkins.push(checkin)

    if (i % 7 === 0) {
      const wk = i / 7
      const weight = bodyProfile[bodyProfile.length - 1].weightKg
      photos.push(
        { id: `photo-${date}-front`, date, pose: 'front', url: null, weightKg: weight, note: wk === 0 ? 'Day 0' : null },
        { id: `photo-${date}-side`, date, pose: 'side', url: null, weightKg: weight, note: null },
      )
    }
  }

  const load: TrainingLoadDay[] = []
  for (let i = 0; i <= DAY_ZERO_OFFSET; i++) {
    const idx = i + HISTORY
    const window = (n: number) => dailyLoads.slice(Math.max(0, idx - n + 1), idx + 1)
    const shortTerm = window(7).reduce((a, b) => a + b, 0)
    const longTerm = window(42).reduce((a, b) => a + b, 0) / 6
    const ratio = longTerm > 0 ? shortTerm / longTerm : 1
    load.push({
      date: iso(addDays(dayZero, i)),
      dailyLoad: dailyLoads[idx],
      shortTerm: Math.round(shortTerm),
      longTerm: Math.round(longTerm),
      ratio: round(ratio, 2),
      status: loadStatus(ratio),
      source: 'coros',
    })
  }

  const fitness: FitnessAssessment[] = [0, 28, 56].map((offset, n) => ({
    date: iso(addDays(dayZero, offset)),
    vo2max: [52.1, 53.0, 53.8][n],
    lactateThresholdHr: [171, 172, 172][n],
    thresholdPaceSecPerKm: [256, 252, 249][n],
    fitnessIndex: [61, 63, 65][n],
    racePredictions: [
      { label: '5K', distanceKm: 5, seconds: [1192, 1176, 1163][n] },
      { label: '10K', distanceKm: 10, seconds: [2486, 2451, 2424][n] },
      { label: 'Half', distanceKm: 21.0975, seconds: [5590, 5510, 5448][n] },
      { label: 'Marathon', distanceKm: 42.195, seconds: [12040, 11870, 11740][n] },
    ],
    source: 'coros',
  }))

  const compositions: BodyComposition[] = [
    {
      id: 'dexa-day-0',
      date: iso(dayZero),
      label: 'Day 0',
      source: 'dexa',
      weightKg: 76.0,
      leanMassKg: 60.0,
      fatMassKg: 12.9,
      boneMassKg: 3.1,
      bodyFatPct: 17.0,
      visceralFatG: 380,
      regional: {
        trunk: { leanKg: 29.4, fatKg: 6.6 },
        arms: { leanKg: 7.6, fatKg: 1.3 },
        legs: { leanKg: 20.1, fatKg: 4.2 },
      },
      notes: 'Baseline scan, fasted, morning.',
    },
    {
      id: 'dexa-week-8',
      date: iso(addDays(dayZero, 56)),
      label: 'Week 8',
      source: 'dexa',
      weightKg: 77.9,
      leanMassKg: 62.4,
      fatMassKg: 12.4,
      boneMassKg: 3.1,
      bodyFatPct: 15.9,
      visceralFatG: 350,
      regional: {
        trunk: { leanKg: 30.4, fatKg: 6.3 },
        arms: { leanKg: 8.1, fatKg: 1.2 },
        legs: { leanKg: 20.9, fatKg: 4.1 },
      },
      notes: 'Same machine, same time of day.',
    },
  ]

  const weekStart = (w: number) => iso(addDays(dayZero, w * 7))
  const focus: FocusNote[] = [
    {
      weekStart: weekStart(6),
      measured: 'Weight +0.2 kg, protein avg 181 g, sleep 7h 21m.',
      noticed: 'Two nights under 6h 45m lined up with the two flat lifting days.',
      action: 'Move the long run to Saturday morning so Friday sleep is protected.',
    },
    {
      weekStart: weekStart(7),
      measured: 'Weight +0.3 kg, HRV 7-day avg 63 ms, load ratio 1.14.',
      noticed: 'Recovery held above 70% all week with the run moved.',
      action: 'Add a third set to the lower-body compound lifts.',
    },
    {
      weekStart: weekStart(8),
      measured: 'Week 8 DEXA: lean +2.4 kg, fat −0.5 kg since Day 0.',
      noticed: 'Gaining lean faster than planned; fat is not creeping.',
      action: 'Hold calories at 3,000. Re-scan at week 16 before the cut.',
    },
  ]

  return {
    generatedAt: today.toISOString(),
    source: 'fixtures',
    today: iso(today),
    phases,
    focus,
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