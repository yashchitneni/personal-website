import type { LoadStatus, RecoveryStatus } from '@/app/types/health'

/** Coros recovery 0–100 → the four-bucket status the /health UI renders. */
export function recoveryStatusFromPct(pct: number): RecoveryStatus {
  if (pct >= 90) return 'full'
  if (pct >= 70) return 'good'
  if (pct >= 45) return 'partial'
  return 'low'
}

/**
 * Acute/chronic load ratio (7-day / 42-day) → status.
 * Bands match the fixture page so live data reads the same way.
 */
export function loadStatusFromRatio(ratio: number): LoadStatus {
  if (ratio < 0.8) return 'detraining'
  if (ratio < 1.0) return 'maintaining'
  if (ratio <= 1.3) return 'optimal'
  if (ratio <= 1.5) return 'high'
  return 'overreaching'
}
