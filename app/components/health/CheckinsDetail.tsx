import { avg, lastN } from '@/app/lib/health/derive'
import { CHECKIN_LABELS, fmtSigned } from '@/app/lib/health/format'
import { cn } from '@/app/lib/utils'
import type { CheckinKey, SubjectiveCheckin } from '@/app/types/health'
import { Eyebrow } from './primitives'

interface CheckinsDetailProps {
  checkins: SubjectiveCheckin[]
}

/** for these, a lower score is the good direction */
const LOWER_IS_BETTER: CheckinKey[] = ['hunger', 'cravings', 'soreness']

const KEYS = Object.keys(CHECKIN_LABELS) as CheckinKey[]

export function CheckinsDetail({ checkins }: CheckinsDetailProps) {
  const week = lastN(checkins, 7)
  const month = lastN(checkins, 28)

  return (
    <div className="space-y-6">
      <Eyebrow>Self-report, 1–5 · 7-day average vs the previous 28</Eyebrow>
      <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {KEYS.map((key) => {
          const now = avg(week.map((c) => c[key]))
          const base = avg(month.map((c) => c[key]))
          const delta = now !== null && base !== null ? now - base : null
          const good = delta === null || Math.abs(delta) < 0.15 ? null : LOWER_IS_BETTER.includes(key) ? delta < 0 : delta > 0
          return (
            <li key={key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-stone-600">{CHECKIN_LABELS[key]}</span>
                <span className="text-sm tabular-nums text-stone-900">
                  {now === null ? '—' : now.toFixed(1)}
                  <span className={cn('ml-2 text-xs', good === null ? 'text-stone-400' : good ? 'text-emerald-700' : 'text-rose-700')}>{fmtSigned(delta, 1)}</span>
                </span>
              </div>
              <div className="mt-2 flex gap-1" aria-hidden>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={cn('block h-1 flex-1 rounded-full', now !== null && n <= Math.round(now) ? 'bg-stone-900' : 'bg-stone-200')} />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
