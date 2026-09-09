import type { BodyComposition } from '@/app/types/health'
import { LB_PER_KG, lbToKg as kg } from '../format'
import { DEXA_DAY_ZERO } from './dexa-2026-09-08-arc'

/**
 * Prior DEXA scans, transcribed from the emailed PDFs. Different facilities and
 * machines, so they are context for Day 0 rather than part of the arc: the arc
 * itself is measured on the ARC Prodigy only. Values kept in the report's
 * pounds and converted once.
 */

const bodySpec2023 = {
  measured: '2023-05-23',
  totalMassLb: 176.8,
  fatLb: 39.1,
  leanLb: 131.0,
  bmcLb: 6.7,
  fatPct: 22.1,
  androidGynoidRatio: 1.08,
  vatLb: 0.76,
  rmrKcal: 1643,
} as const

const apeiron2025 = {
  measured: '2025-06-24',
  scaleWeightLb: 186,
  totalMassLb: 189.0,
  fatLb: 55.1,
  leanLb: 126.8,
  bmcLb: 7.1,
  regionFatPct: 29.2,
  tissueFatPct: 30.3,
  androidGynoidRatio: 1.37,
  vatLb: 1.95,
} as const

const g = (lb: number) => Math.round((lb / LB_PER_KG) * 1000)

export const DEXA_BODYSPEC_2023: BodyComposition = {
  id: 'dexa-2023-05-23-bodyspec',
  date: bodySpec2023.measured,
  label: 'May 2023',
  source: 'dexa',
  weightKg: kg(bodySpec2023.totalMassLb),
  totalMassKg: kg(bodySpec2023.totalMassLb),
  leanMassKg: kg(bodySpec2023.leanLb),
  fatMassKg: kg(bodySpec2023.fatLb),
  boneMassKg: kg(bodySpec2023.bmcLb),
  fatFreeMassKg: kg(bodySpec2023.leanLb + bodySpec2023.bmcLb),
  bodyFatPct: bodySpec2023.fatPct,
  tissueLeanPct: null,
  visceralFatG: g(bodySpec2023.vatLb),
  regional: null,
  symmetry: null,
  androidGynoidRatio: bodySpec2023.androidGynoidRatio,
  rmrKcal: bodySpec2023.rmrKcal,
  rsmiKgM2: null,
  bmi: null,
  heightCm: DEXA_DAY_ZERO.heightCm,
  ageYears: null,
  facility: 'BodySpec, Austin TX',
  device: null,
  patientRef: null,
  reportUrl: null,
  notes: null,
}

export const DEXA_APEIRON_2025: BodyComposition = {
  id: 'dexa-2025-06-24-apeiron',
  date: apeiron2025.measured,
  label: 'Jun 2025',
  source: 'dexa',
  weightKg: kg(apeiron2025.scaleWeightLb),
  totalMassKg: kg(apeiron2025.totalMassLb),
  leanMassKg: kg(apeiron2025.leanLb),
  fatMassKg: kg(apeiron2025.fatLb),
  boneMassKg: kg(apeiron2025.bmcLb),
  fatFreeMassKg: kg(apeiron2025.leanLb + apeiron2025.bmcLb),
  bodyFatPct: apeiron2025.regionFatPct,
  tissueLeanPct: Math.round((100 - apeiron2025.tissueFatPct) * 10) / 10,
  visceralFatG: g(apeiron2025.vatLb),
  regional: null,
  symmetry: null,
  androidGynoidRatio: apeiron2025.androidGynoidRatio,
  rmrKcal: null,
  rsmiKgM2: null,
  bmi: null,
  heightCm: DEXA_DAY_ZERO.heightCm,
  ageYears: null,
  facility: 'Apeiron, Austin TX',
  device: 'GE Lunar iDXA',
  patientRef: null,
  reportUrl: null,
  notes: 'Peak fat mass on record.',
}

/** All scans, oldest first. Day 0 is the arc baseline; the rest is history. */
export const DEXA_HISTORY: BodyComposition[] = [DEXA_BODYSPEC_2023, DEXA_APEIRON_2025, DEXA_DAY_ZERO]
