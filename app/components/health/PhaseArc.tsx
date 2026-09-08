import { cn } from '@/app/lib/utils'
import type { ArcState, PhaseState } from '@/app/lib/health/derive'
import { fmtDate } from '@/app/lib/health/format'

interface PhaseArcProps {
  arc: ArcState
  phase: PhaseState
}

/** The whole plan on one line: build → cut, with today marked. */
export function PhaseArc({ arc, phase }: PhaseArcProps) {
  return (
    <div className="mt-10">
      <div className="relative h-px w-full bg-stone-200">
        {arc.segments.map((seg) => {
          const active = seg.phase.id === phase.current?.id
          const done = active ? phase.progressPct : seg.phase.startDate < arc.startDate ? 100 : 0
          return (
            <div key={seg.phase.id} className="absolute inset-y-0" style={{ left: `${seg.startPct}%`, width: `${seg.widthPct}%` }}>
              <div className={cn('absolute inset-y-0 left-0 bg-stone-900')} style={{ width: `${done}%` }} />
              <div className="absolute -top-[3px] left-0 h-[7px] w-px bg-stone-300" />
            </div>
          )
        })}
        <div className="absolute -top-[3px] right-0 h-[7px] w-px bg-stone-300" />
        <div
          className="absolute -top-[5px] h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-[#fbfaf8] bg-stone-900 shadow-[0_0_0_1px_rgb(28_25_23)]"
          style={{ left: `${arc.todayPct}%` }}
          aria-label="Today"
        />
      </div>
      <div className="relative mt-3 h-10 text-[11px] uppercase tracking-[0.14em] text-stone-400">
        {arc.segments.map((seg) => {
          const active = seg.phase.id === phase.current?.id
          return (
            <div key={seg.phase.id} className="absolute top-0" style={{ left: `${seg.startPct}%`, width: `${seg.widthPct}%` }}>
              <div className={cn('flex flex-col gap-0.5', active && 'text-stone-900')}>
                <span>
                  {seg.phase.label} · {seg.phase.plannedWeeks} wk
                </span>
                <span className="normal-case tracking-normal text-stone-400">{fmtDate(seg.phase.startDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
