import type { BodyComposition } from '@/app/types/health'

/**
 * Day 0 DEXA — ARC South 1st (Austin), GE Lunar Prodigy, measured 2026-09-08.
 * Transcribed from the printed "Body Composition / BMD" and "Lean Balance and
 * Fat Distribution" reports. The report is in pounds; the model is in kg, so
 * the source numbers are kept here verbatim and converted once.
 */

export const LB_PER_KG = 2.20462
const kg = (lb: number) => Math.round((lb / LB_PER_KG) * 100) / 100

/** Verbatim report values (lb / % / in). Kept so the conversion is auditable. */
export const DEXA_2026_09_08_REPORT = {
  measured: '2026-09-08',
  facility: 'ARC South 1st, Austin TX',
  device: 'GE Lunar Prodigy',
  patientRef: 'Q25266',
  heightIn: 70.0,
  weightLb: 176.4,
  bmi: 25.3,
  ageYears: 33.4,
  totalMassLb: 175.6,
  leanMassLb: 128.1,
  tissueLeanPct: 73.0,
  fatMassLb: 40.6,
  fatFreeMassLb: 135.0,
  regionFatPct: { arms: 20.3, legs: 22.7, trunk: 24.8, android: 25.6, gynoid: 22.5, total: 23.1 },
  androidGynoidRatio: 1.12,
  rmrKcal: 1830,
  rsmiKgM2: 8.85,
  leanBalanceLb: {
    arms: { right: 8.3, left: 8.3 },
    legs: { right: 22.9, left: 22.2 },
    trunk: { right: 28.7, left: 30.1 },
    total: { right: 64.7, left: 63.4 },
  },
} as const

const r = DEXA_2026_09_08_REPORT
const sym = (v: { left: number; right: number }) => ({ leftKg: kg(v.left), rightKg: kg(v.right) })
const regionLean = (v: { left: number; right: number }) => kg(v.left + v.right)

export const DEXA_DAY_ZERO: BodyComposition = {
  id: 'dexa-2026-09-08-arc',
  date: r.measured,
  label: 'Day 0',
  source: 'dexa',
  weightKg: kg(r.weightLb),
  totalMassKg: kg(r.totalMassLb),
  leanMassKg: kg(r.leanMassLb),
  fatMassKg: kg(r.fatMassLb),
  boneMassKg: kg(r.fatFreeMassLb - r.leanMassLb),
  fatFreeMassKg: kg(r.fatFreeMassLb),
  bodyFatPct: r.regionFatPct.total,
  tissueLeanPct: r.tissueLeanPct,
  visceralFatG: null,
  regional: {
    arms: { leanKg: regionLean(r.leanBalanceLb.arms), fatKg: null, fatPct: r.regionFatPct.arms },
    legs: { leanKg: regionLean(r.leanBalanceLb.legs), fatKg: null, fatPct: r.regionFatPct.legs },
    trunk: { leanKg: regionLean(r.leanBalanceLb.trunk), fatKg: null, fatPct: r.regionFatPct.trunk },
    android: { leanKg: null, fatKg: null, fatPct: r.regionFatPct.android },
    gynoid: { leanKg: null, fatKg: null, fatPct: r.regionFatPct.gynoid },
  },
  symmetry: {
    arms: sym(r.leanBalanceLb.arms),
    legs: sym(r.leanBalanceLb.legs),
    trunk: sym(r.leanBalanceLb.trunk),
    total: sym(r.leanBalanceLb.total),
  },
  androidGynoidRatio: r.androidGynoidRatio,
  rmrKcal: r.rmrKcal,
  rsmiKgM2: r.rsmiKgM2,
  bmi: r.bmi,
  heightCm: Math.round(r.heightIn * 2.54 * 10) / 10,
  ageYears: r.ageYears,
  facility: r.facility,
  device: r.device,
  patientRef: r.patientRef,
  reportUrl: null,
  notes: 'Baseline scan. ARC marks this facility series as baseline; re-scan on the same machine.',
}
