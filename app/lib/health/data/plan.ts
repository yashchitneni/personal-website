import { addDays, format, parseISO } from 'date-fns'
import type { FocusNote, Goal, RecompPhase, SupplementProtocol } from '@/app/types/health'
import { lbToKg } from '../format'
import { DEXA_DAY_ZERO } from './dexa-2026-09-08-arc'

/**
 * The plan that goes with Day 0: the active goal and the supplement protocols
 * being run. Real, not generated. Edit here (or upsert via /api/health/ingest)
 * as the plan changes.
 */

const iso = (d: Date) => format(d, 'yyyy-MM-dd')
const dayZero = parseISO(DEXA_DAY_ZERO.date)

/** Planned length of the current build and the cut that follows. */
export const BUILD_WEEKS = 16
export const CUT_WEEKS = 12
const buildEnd = iso(addDays(dayZero, BUILD_WEEKS * 7))

/**
 * Authored recomp phases. Seed these via POST /api/health/seed (or ingest)
 * before the first Coros sync so /health does not flip to an empty warehouse.
 */
export const PHASES: RecompPhase[] = [
  {
    id: 'phase-build-1',
    kind: 'build',
    label: 'Build',
    startDate: DEXA_DAY_ZERO.date,
    endDate: null,
    plannedWeeks: BUILD_WEEKS,
    goal: '+5 lb DEXA lean by Nov 8. Modest fat gain allowed; lean first. Sleep above 7h.',
  },
  {
    id: 'phase-cut-1',
    kind: 'cut',
    label: 'Cut',
    startDate: buildEnd,
    endDate: null,
    plannedWeeks: CUT_WEEKS,
    goal: 'Bring body fat from 23% toward 15% while holding lean mass within 2 lb.',
  },
]

export const FOCUS: FocusNote[] = [
  {
    weekStart: DEXA_DAY_ZERO.date,
    measured: 'Day 0 DEXA: 128.1 lb lean, 40.6 lb fat, 23.1%. Fat −14.5 lb and lean +1.3 lb since the Jun 2025 scan.',
    noticed: 'The Jun 2025 peak is reversed; body fat is back near the 2023 level with 2.9 lb less lean. Fat sits mostly in the trunk (24.8%).',
    action: 'Build starts today: 3,000 kcal, 180 g protein, four lifts and two runs a week. Creatine load this week, then 10 g/day. Re-scan on the ARC Prodigy at week 8.',
  },
]

/** +5 lb of DEXA lean mass in two months, fat allowed to drift up a little. */
export const GOAL_LEAN_2M: Goal = {
  id: 'goal-lean-2026-11',
  metric: 'lean_mass',
  label: '+5 lb lean',
  startDate: DEXA_DAY_ZERO.date,
  targetDate: '2026-11-08',
  startValue: DEXA_DAY_ZERO.leanMassKg,
  targetValue: lbToKg(128.1 + 5),
  unit: 'kg',
  measuredBy: 'dexa',
  status: 'active',
  notes: 'Modest fat gain allowed. Lean first.',
}

export const GOALS: Goal[] = [GOAL_LEAN_2M]

/** Creatine: a short load, then a 10 g/day maintenance — double the usual 5 g. */
export const CREATINE: SupplementProtocol = {
  id: 'supp-creatine',
  name: 'Creatine monohydrate',
  category: 'performance',
  status: 'active',
  phases: [
    {
      label: 'Load',
      startDate: DEXA_DAY_ZERO.date,
      endDate: iso(addDays(dayZero, 6)),
      dose: { amount: 5, unit: 'g', perDay: 4, timing: 'split through the day' },
      notes: '~20 g/day for a week to saturate quickly.',
    },
    {
      label: 'Maintain',
      startDate: iso(addDays(dayZero, 7)),
      endDate: null,
      dose: { amount: 10, unit: 'g', perDay: 1, timing: 'with breakfast' },
      notes: null,
    },
  ],
  rationale: '10 g/day rather than the standard 5 g: his protocol for the build, reviewed at the week-8 scan.',
  notes: null,
}

/** Reserved slot: contents are being decided, so nothing is listed yet. */
export const BRAIN_STACK: SupplementProtocol = {
  id: 'supp-brain-stack',
  name: 'Brain stack',
  category: 'cognitive',
  status: 'planned',
  phases: [],
  rationale: null,
  notes: 'Details to be decided. Slot reserved so the log and page are ready when it starts.',
}

export const SUPPLEMENTS: SupplementProtocol[] = [CREATINE, BRAIN_STACK]
