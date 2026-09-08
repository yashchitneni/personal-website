import { format, parseISO } from 'date-fns'
import type { CheckinKey, ISODate, Sport } from '@/app/types/health'

export const CHECKIN_LABELS: Record<CheckinKey, string> = {
  sleepQuality: 'Sleep quality',
  energy: 'Energy',
  mood: 'Mood',
  hunger: 'Hunger',
  cravings: 'Cravings',
  digestion: 'Digestion',
  soreness: 'Soreness',
  gymPerformance: 'Gym performance',
  sexDrive: 'Sex drive',
}

export const SPORT_LABELS: Record<Sport, string> = {
  run: 'Run',
  strength: 'Strength',
  bike: 'Bike',
  swim: 'Swim',
  hike: 'Hike',
  walk: 'Walk',
  row: 'Row',
  mobility: 'Mobility',
  other: 'Other',
}

export function fmtDate(date: ISODate, pattern = 'MMM d'): string {
  return format(parseISO(date), pattern)
}

export function fmtNumber(n: number | null | undefined, dp = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

/** +1.2 / −0.4, with a real minus sign */
export function fmtSigned(n: number | null | undefined, dp = 1, unit = ''): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  const rounded = Number(n.toFixed(dp))
  if (rounded === 0) return `0${unit}`
  const sign = rounded > 0 ? '+' : '−'
  return `${sign}${Math.abs(rounded).toFixed(dp)}${unit}`
}

export function fmtKg(n: number | null | undefined, dp = 1): string {
  return n === null || n === undefined ? '—' : `${n.toFixed(dp)} kg`
}

/** 7h 24m */
export function fmtMinutes(min: number | null | undefined): string {
  if (min === null || min === undefined) return '—'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

/** 1:02:14 or 42:10 */
export function fmtClock(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

/** 4:09 /km */
export function fmtPace(secPerKm: number | null | undefined): string {
  if (secPerKm === null || secPerKm === undefined) return '—'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

export function fmtKm(meters: number | null | undefined, dp = 1): string {
  if (meters === null || meters === undefined) return '—'
  return `${(meters / 1000).toFixed(dp)} km`
}
