import { differenceInCalendarDays, parseISO } from 'date-fns'
import { dailyDose, getCurrentSupplementPhase } from '@/app/lib/health/derive'
import { fmtDate, fmtNumber } from '@/app/lib/health/format'
import { cn } from '@/app/lib/utils'
import type { ISODate, SupplementCategory, SupplementLogEntry, SupplementPhase, SupplementProtocol, SupplementStatus } from '@/app/types/health'
import { Eyebrow } from './primitives'

interface SupplementsDetailProps {
  supplements: SupplementProtocol[]
  log: SupplementLogEntry[]
  today: ISODate
}

const CATEGORY: Record<SupplementCategory, string> = {
  performance: 'Performance',
  cognitive: 'Cognitive',
  recovery: 'Recovery',
  general: 'General',
}

const STATUS: Record<SupplementStatus, string> = {
  active: 'active',
  planned: 'planned',
  paused: 'paused',
  stopped: 'stopped',
}

export function fmtDose(amount: number, unit: string) {
  return `${fmtNumber(amount, Number.isInteger(amount) ? 0 : 1)} ${unit}`
}

/** Protocol steps as an equal-width stepper: the live step is in ink, past steps filled, future steps hairline. */
function PhaseStrip({ protocol, today }: { protocol: SupplementProtocol; today: ISODate }) {
  const phases = protocol.phases
  if (phases.length === 0) return null
  const current = getCurrentSupplementPhase(protocol, today)
  const state = (p: SupplementPhase) => (p === current ? 'current' : p.endDate && p.endDate < today ? 'past' : 'future')

  return (
    <ol className="mt-4 flex gap-3">
      {phases.map((p) => {
        const daily = dailyDose(p.dose)
        const st = state(p)
        const days = p.endDate ? differenceInCalendarDays(parseISO(p.endDate), parseISO(p.startDate)) + 1 : null
        return (
          <li key={p.label} className="min-w-0 flex-1">
            <div className={cn('h-px w-full', st === 'current' ? 'bg-stone-900' : st === 'past' ? 'bg-stone-400' : 'bg-stone-200')} />
            <div className="mt-2 text-[11px] leading-tight">
              <div className={cn('tabular-nums', st === 'current' ? 'text-stone-900' : 'text-stone-500')}>
                {p.label} · {fmtDose(daily.amount, daily.unit)}/day
              </div>
              <div className="text-stone-400">
                {fmtDate(p.startDate)}
                {p.endDate ? ` – ${fmtDate(p.endDate)}` : ' →'}
                {days !== null && ` · ${days} d`}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function SupplementsDetail({ supplements, log, today }: SupplementsDetailProps) {
  const ordered = [...supplements].sort((a, b) => {
    const rank: Record<SupplementStatus, number> = { active: 0, paused: 1, planned: 2, stopped: 3 }
    return rank[a.status] - rank[b.status]
  })

  return (
    <div className="space-y-10">
      {ordered.map((s) => {
        const current = getCurrentSupplementPhase(s, today)
        const daily = current ? dailyDose(current.dose) : null
        const logged = log.filter((l) => l.supplementId === s.id)
        return (
          <div key={s.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <div className="flex items-baseline gap-4">
                <span className="text-base text-stone-900">{s.name}</span>
                <Eyebrow>
                  {CATEGORY[s.category]} <span className="text-stone-300">·</span>{' '}
                  <span className={cn(s.status === 'active' ? 'text-stone-900' : 'text-stone-400')}>{STATUS[s.status]}</span>
                </Eyebrow>
              </div>
              {daily && (
                <span className="font-display text-2xl font-light tabular-nums tracking-tight text-stone-900">
                  {fmtDose(daily.amount, daily.unit)}
                  <span className="text-base text-stone-400">/day</span>
                </span>
              )}
            </div>

            {current && (
              <p className="mt-1 text-sm text-stone-500">
                {current.label} phase
                {current.dose.perDay > 1 && ` · ${current.dose.perDay} × ${fmtDose(current.dose.amount, current.dose.unit)}`}
                {current.dose.timing && ` · ${current.dose.timing}`}
                {current.notes && ` · ${current.notes}`}
              </p>
            )}

            <PhaseStrip protocol={s} today={today} />

            {s.rationale && <p className="mt-3 text-sm text-stone-600">{s.rationale}</p>}
            {s.phases.length === 0 && s.notes && <p className="mt-2 text-sm text-stone-400">{s.notes}</p>}
            {s.phases.length > 0 && s.notes && <p className="mt-1 text-xs text-stone-400">{s.notes}</p>}
            {logged.length > 0 && (
              <p className="mt-2 text-xs text-stone-400">
                {logged.length} dose{logged.length === 1 ? '' : 's'} logged · last {fmtDate(logged[logged.length - 1].date)}
              </p>
            )}
          </div>
        )
      })}
      <p className="text-xs text-stone-400">Doses are logged in chat as they are taken; adherence shows here once the log has entries.</p>
    </div>
  )
}
