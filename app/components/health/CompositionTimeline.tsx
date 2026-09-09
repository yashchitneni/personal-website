import { fmtDate, fmtMassValue, fmtSigned, MASS_UNIT, toMass } from '@/app/lib/health/format'
import { cn } from '@/app/lib/utils'
import type { BodyComposition } from '@/app/types/health'
import { Eyebrow } from './primitives'

interface CompositionTimelineProps {
  scans: BodyComposition[]
  /** the scan that opens the arc; scans on other machines render as hollow points */
  dayZero: BodyComposition | null
}

interface Series {
  key: string
  label: string
  unit: string
  pick: (s: BodyComposition) => number | null
  format: (v: number) => string
  formatDelta: (v: number) => string
  /** whether going down is the good direction */
  lowerIsBetter: boolean
}

const W = 600
const H = 64
const PAD_X = 48
const PAD_TOP = 26
const PAD_BOTTOM = 6

/**
 * Every DEXA on record, three stacked panels sharing one time axis: fat mass,
 * lean mass, body fat %. One point per scan with its value printed, a hairline
 * between points, and the step from the previous scan at the right. Scans from
 * a machine other than the arc's are hollow so cross-machine steps read as
 * approximate.
 */
export function CompositionTimeline({ scans, dayZero }: CompositionTimelineProps) {
  const sorted = [...scans].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length < 2) return null

  const onArcMachine = (s: BodyComposition) => s === dayZero || (!!dayZero?.device && s.device === dayZero.device && s.facility === dayZero.facility)

  const series: Series[] = [
    {
      key: 'fat',
      label: 'Fat mass',
      unit: MASS_UNIT,
      pick: (s) => s.fatMassKg,
      format: (v) => fmtMassValue(v),
      formatDelta: (v) => fmtSigned(toMass(v), 1),
      lowerIsBetter: true,
    },
    {
      key: 'lean',
      label: 'Lean mass',
      unit: MASS_UNIT,
      pick: (s) => s.leanMassKg,
      format: (v) => fmtMassValue(v),
      formatDelta: (v) => fmtSigned(toMass(v), 1),
      lowerIsBetter: false,
    },
    {
      key: 'pct',
      label: 'Body fat',
      unit: '%',
      pick: (s) => s.bodyFatPct,
      format: (v) => v.toFixed(1),
      formatDelta: (v) => fmtSigned(v, 1),
      lowerIsBetter: true,
    },
  ]

  const x = (i: number) => PAD_X + (i / (sorted.length - 1)) * (W - PAD_X * 2)
  const lastIdx = sorted.length - 1

  return (
    <div>
      <div className="divide-y divide-stone-100">
        {series.map((ser) => {
          const values = sorted.map((s) => ser.pick(s))
          const nums = values.filter((v): v is number => v !== null)
          const min = Math.min(...nums)
          const max = Math.max(...nums)
          const range = max - min || 1
          const y = (v: number) => H - PAD_BOTTOM - ((v - min) / range) * (H - PAD_TOP - PAD_BOTTOM)
          const path = values
            .map((v, i) => (v === null ? null : `${x(i).toFixed(1)} ${y(v).toFixed(1)}`))
            .filter((p): p is string => p !== null)
            .map((p, k) => `${k === 0 ? 'M' : 'L'}${p}`)
            .join(' ')
          const delta = values[lastIdx] !== null && values[lastIdx - 1] !== null ? values[lastIdx]! - values[lastIdx - 1]! : null
          const good = delta === null ? null : ser.lowerIsBetter ? delta < 0 : delta > 0

          return (
            <div key={ser.key} className="grid items-center gap-4 py-3 md:grid-cols-[7rem_1fr_6rem]">
              <Eyebrow>
                {ser.label} <span className="text-stone-400">{ser.unit}</span>
              </Eyebrow>
              {/* The SVG only draws the hairline and stretches to fit; dots and values are HTML so they keep their size at any width. */}
              <div className="relative h-16">
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full text-stone-900" role="img" aria-label={`${ser.label} across scans`}>
                  <path d={path} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                </svg>
                {sorted.map((s, i) => {
                  const v = values[i]
                  if (v === null) return null
                  const isLast = i === lastIdx
                  const left = `${(x(i) / W) * 100}%`
                  const top = `${(y(v) / H) * 100}%`
                  return (
                    <span key={s.id}>
                      <span
                        className={cn(
                          'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-900',
                          isLast ? 'h-2.5 w-2.5' : 'h-2 w-2',
                          onArcMachine(s) ? 'bg-stone-900' : 'bg-[#fbfaf8]',
                        )}
                        style={{ left, top }}
                      />
                      <span
                        className={cn('absolute -translate-x-1/2 -translate-y-full whitespace-nowrap text-xs tabular-nums', isLast ? 'text-stone-900' : 'text-stone-500')}
                        style={{ left, top: `calc(${top} - 8px)` }}
                      >
                        {ser.format(v)}
                      </span>
                    </span>
                  )
                })}
              </div>
              <div className={cn('text-right text-xs tabular-nums', delta === null || Math.abs(delta) < 0.05 ? 'text-stone-400' : good ? 'text-emerald-700' : 'text-rose-700')}>
                {delta === null ? '' : ser.formatDelta(delta)} <span className="text-stone-400">vs last</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* margins match the grid's label / delta columns plus their gaps */}
      <div className="relative mt-2 h-9 text-[11px] leading-tight text-stone-400 md:ml-[8rem] md:mr-[7rem]">
        {sorted.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              'absolute top-0',
              i === 0 ? 'text-left' : i === lastIdx ? '-translate-x-full text-right' : '-translate-x-1/2 text-center',
            )}
            style={{ left: `${(x(i) / W) * 100}%` }}
          >
            <div className={cn(s === dayZero ? 'text-stone-900' : 'text-stone-500')}>{s.label ?? fmtDate(s.date, 'MMM yyyy')}</div>
            <div className="hidden whitespace-nowrap sm:block">
              {s.facility?.split(',')[0]}
              {s.device ? ` · ${s.device.replace('GE Lunar ', '')}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
