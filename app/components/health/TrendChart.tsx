import { fmtDate } from '@/app/lib/health/format'
import type { ISODate } from '@/app/types/health'

export interface TrendPoint {
  date: ISODate
  value: number | null
}

export interface TrendMarker {
  date: ISODate
  label: string
}

interface TrendChartProps {
  points: TrendPoint[]
  markers?: TrendMarker[]
  /** draw a smoothed 7-point average on top of the raw series */
  smooth?: boolean
  format?: (v: number) => string
  /** optional horizontal reference line (e.g. a target) */
  reference?: { value: number; label: string }
}

const W = 600
const H = 180
const PAD = { top: 12, right: 12, bottom: 12, left: 12 }

/**
 * Editorial line chart: raw series as a faint line, 7-day average as the ink
 * line, vertical hairlines for markers (DEXA scans). Labels live in HTML so
 * they don't scale with the SVG.
 */
export function TrendChart({ points, markers = [], smooth = true, format = (v) => v.toFixed(1), reference }: TrendChartProps) {
  const valid = points.map((p, i) => ({ ...p, i })).filter((p): p is TrendPoint & { i: number; value: number } => p.value !== null)
  if (valid.length < 2) {
    return <div className="text-sm text-stone-400">Not enough data yet.</div>
  }

  const values = valid.map((p) => p.value)
  const min = Math.min(...values, reference?.value ?? Infinity)
  const max = Math.max(...values, reference?.value ?? -Infinity)
  const range = max - min || 1
  const x = (i: number) => PAD.left + (i / Math.max(1, points.length - 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) => H - PAD.bottom - ((v - min) / range) * (H - PAD.top - PAD.bottom)

  const raw = valid.map((p, k) => `${k === 0 ? 'M' : 'L'}${x(p.i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')

  let avgPath = ''
  let lastMean: number | null = null
  if (smooth) {
    const window = 7
    const pts = valid.map((p, k) => {
      const slice = valid.slice(Math.max(0, k - window + 1), k + 1)
      const mean = slice.reduce((a, b) => a + b.value, 0) / slice.length
      lastMean = mean
      return `${k === 0 ? 'M' : 'L'}${x(p.i).toFixed(1)} ${y(mean).toFixed(1)}`
    })
    avgPath = pts.join(' ')
  }

  const lastPoint = valid[valid.length - 1]
  const dotY = smooth && lastMean !== null ? y(lastMean) : y(lastPoint.value)
  const markerXs = markers
    .map((m) => ({ ...m, i: points.findIndex((p) => p.date === m.date) }))
    .filter((m) => m.i >= 0)
  const markerAtStart = markerXs.some((m) => m.i === 0)
  const markerAtEnd = markerXs.some((m) => m.i === points.length - 1)

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-1 text-[11px] tabular-nums text-stone-400">
          <span>{format(max)}</span>
          <span>{format(min)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="ml-12 h-auto w-[calc(100%-3rem)]" role="img" aria-label="Trend chart">
        {reference && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(reference.value)}
            y2={y(reference.value)}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {markerXs.map((m) => (
          <line
            key={m.date}
            x1={x(m.i)}
            x2={x(m.i)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="currentColor"
            strokeOpacity={0.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={raw} fill="none" stroke="currentColor" strokeOpacity={smooth ? 0.22 : 0.9} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {smooth && (
          <path d={avgPath} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        <circle cx={x(lastPoint.i)} cy={dotY} r={3} fill="currentColor" />
      </svg>
      </div>
      <div className="ml-12 mt-2 flex justify-between text-[11px] text-stone-400">
        {!markerAtStart && <span>{fmtDate(points[0].date)}</span>}
        {markerXs.map((m) => (
          <span key={m.date} className="text-stone-500">
            {m.label} · {fmtDate(m.date)}
          </span>
        ))}
        {!markerAtEnd && <span>{fmtDate(points[points.length - 1].date)}</span>}
      </div>
    </div>
  )
}
