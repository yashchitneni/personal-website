import { fmtDate, fmtMinutes, fmtNumber, fmtSigned } from '@/app/lib/health/format'
import { cn } from '@/app/lib/utils'
import type { WeeklyDelta } from '@/app/types/health'
import { Eyebrow } from './primitives'

interface WeeklyLedgerProps {
  weeks: WeeklyDelta[]
}

const COLS = ['Week', 'Weight', 'Δ', 'Sleep', 'HRV', 'RHR', 'Load', 'Sessions', 'Protein', 'kcal']

/** Change over time, one row per week. The core of the page: is the arc working? */
export function WeeklyLedger({ weeks }: WeeklyLedgerProps) {
  const rows = [...weeks].reverse()
  return (
    <section aria-label="Week by week">
      <Eyebrow className="mb-4">Week by week</Eyebrow>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              {COLS.map((c, i) => (
                <th key={c} scope="col" className={cn('py-2 text-[11px] font-normal uppercase tracking-[0.14em] text-stone-500', i === 0 ? 'text-left' : 'pl-4 text-right')}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((w, idx) => (
              <tr key={w.weekStart} className={cn('border-b border-stone-100 last:border-0', idx === 0 && 'text-stone-900')}>
                <td className="py-3 text-left">
                  <span className={cn('tabular-nums', idx === 0 ? 'text-stone-900' : 'text-stone-500')}>{w.weekIndex}</span>
                  <span className="ml-2 text-xs text-stone-400">{fmtDate(w.weekStart)}</span>
                </td>
                <Cell>{w.weightAvgKg === null ? '—' : `${w.weightAvgKg.toFixed(1)}`}</Cell>
                <Cell className={w.weightDeltaKg === null ? 'text-stone-400' : w.weightDeltaKg > 0 ? 'text-stone-900' : 'text-stone-500'}>{fmtSigned(w.weightDeltaKg, 1)}</Cell>
                <Cell>{w.sleepDurationAvgMin === null ? '—' : fmtMinutes(w.sleepDurationAvgMin)}</Cell>
                <Cell>{fmtNumber(w.hrvAvgMs)}</Cell>
                <Cell>{fmtNumber(w.restingHrAvg)}</Cell>
                <Cell>{fmtNumber(w.weeklyLoad)}</Cell>
                <Cell>{w.sessions}</Cell>
                <Cell>{w.proteinAvgG === null ? '—' : `${fmtNumber(w.proteinAvgG)} g`}</Cell>
                <Cell>{fmtNumber(w.caloriesAvg)}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('py-3 pl-4 text-right tabular-nums text-stone-700', className)}>{children}</td>
}
