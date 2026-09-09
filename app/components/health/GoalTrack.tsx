import type { GoalProgress } from '@/app/lib/health/derive'
import { fmtDate, fmtMass, fmtMassDelta, fmtNumber, fmtSigned } from '@/app/lib/health/format'
import { cn } from '@/app/lib/utils'
import { Eyebrow } from './primitives'

interface GoalTrackProps {
  goals: GoalProgress[]
}

function fmtValue(v: number | null, unit: GoalProgress['goal']['unit']) {
  if (v === null) return '—'
  return unit === 'kg' ? fmtMass(v) : unit === '%' ? `${v.toFixed(1)}%` : fmtNumber(v, 1)
}

function fmtDelta(v: number | null, unit: GoalProgress['goal']['unit'], dp = 1) {
  if (v === null) return '—'
  return unit === 'kg' ? fmtMassDelta(v, dp) : unit === '%' ? fmtSigned(v, dp, ' pts') : fmtSigned(v, dp)
}

/**
 * Active goals as one hairline each: how much of the gap is closed (ink),
 * how much of the time has passed (tick). Reads left to right like the arc.
 */
export function GoalTrack({ goals }: GoalTrackProps) {
  if (goals.length === 0) return null
  return (
    <div className="mt-12 space-y-8">
      {goals.map((g) => {
        const { goal } = g
        const weeks = Math.floor(g.daysLeft / 7)
        const days = g.daysLeft % 7
        const left = g.daysLeft === 0 ? 'due today' : `${weeks ? `${weeks} wk ` : ''}${days ? `${days} d ` : ''}left`
        return (
          <div key={goal.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <Eyebrow>
                Goal <span className="text-stone-300">/</span> <span className="text-stone-400">by {fmtDate(goal.targetDate, 'MMM d')}</span>
              </Eyebrow>
              <Eyebrow className="text-stone-400">{left}</Eyebrow>
            </div>
            <div className="mt-3 grid items-end gap-x-8 gap-y-4 md:grid-cols-[auto_1fr_auto]">
              <div>
                <div className="font-display text-3xl font-light tabular-nums tracking-tight text-stone-900">{goal.label}</div>
                <div className="mt-1 text-sm tabular-nums text-stone-500">
                  {fmtValue(goal.startValue, goal.unit)} → {fmtValue(goal.targetValue, goal.unit)}
                  {goal.measuredBy === 'dexa' && <span className="text-stone-400"> · DEXA</span>}
                </div>
              </div>
              <div className="pb-2">
                <div className="relative h-px w-full bg-stone-200">
                  <div className="absolute inset-y-0 left-0 bg-stone-900" style={{ width: `${g.fraction * 100}%` }} />
                  <div className="absolute -top-[4px] h-[9px] w-px bg-stone-400" style={{ left: `${g.elapsed * 100}%` }} title="Pro-rata: where progress should be today" />
                  <div className="absolute -top-[3px] right-0 h-[7px] w-px bg-stone-300" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-stone-400">
                  <span>{fmtDate(goal.startDate, 'MMM d')}</span>
                  <span>{fmtDate(goal.targetDate, 'MMM d')}</span>
                </div>
              </div>
              <div className="text-sm tabular-nums md:text-right">
                <div className="text-stone-900">
                  {g.achieved === null ? (
                    <span className="text-stone-500">no scan yet</span>
                  ) : (
                    <>
                      <span className={cn(g.onTrack ? 'text-emerald-700' : 'text-rose-700')}>{fmtDelta(g.achieved, goal.unit)}</span>
                      <span className="text-stone-400"> of {fmtDelta(goal.targetValue - goal.startValue, goal.unit, 0)}</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  {g.requiredPerWeek !== null && `needs ${fmtDelta(g.requiredPerWeek, goal.unit)} / wk`}
                  {g.measuredOn && <span className="text-stone-400"> · measured {fmtDate(g.measuredOn)}</span>}
                </div>
              </div>
            </div>
            {goal.notes && <p className="mt-3 text-sm text-stone-500">{goal.notes}</p>}
          </div>
        )
      })}
    </div>
  )
}
