import type { FocusNote } from '@/app/types/health'
import { fmtDate } from '@/app/lib/health/format'

interface LoopProps {
  focus: FocusNote | null
}

/** Quantify → measure → act, one line each. */
export function Loop({ focus }: LoopProps) {
  if (!focus) return null
  const cells: Array<[string, string]> = [
    ['Measured', focus.measured],
    ['Noticed', focus.noticed],
    ['Acting on', focus.action],
  ]
  return (
    <section aria-label="This week" className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-16">
      <div className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
        <div>This week</div>
        <div className="mt-1 normal-case tracking-normal text-stone-400">wk of {fmtDate(focus.weekStart)}</div>
      </div>
      <dl className="grid gap-6 md:grid-cols-3 md:gap-10">
        {cells.map(([label, text], i) => (
          <div key={label}>
            <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-stone-500">
              <span className="tabular-nums text-stone-300">0{i + 1}</span>
              {label}
            </dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-stone-800">{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
