import type { MetricSummary } from '@/app/types/health'
import { Delta } from './Delta'
import { Sparkline } from './Sparkline'

interface MetricStripProps {
  metrics: MetricSummary[]
}

/** Secondary signals: one quiet tile each — label, value, 7-day change, 28-day line. */
export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <section aria-label="Key signals" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 md:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <div key={m.key} className="flex flex-col justify-between gap-5 bg-[#fbfaf8] px-5 py-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{m.label}</span>
            <Delta display={m.deltaDisplay} trend={m.trend} higherIsBetter={m.higherIsBetter} className="text-xs" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-light tabular-nums tracking-tight text-stone-900">{m.display}</span>
              {m.unit && <span className="text-xs text-stone-400">{m.unit}</span>}
            </div>
            <Sparkline values={m.series} className="mt-3 w-full text-stone-900" width={120} height={26} fill />
          </div>
        </div>
      ))}
    </section>
  )
}
