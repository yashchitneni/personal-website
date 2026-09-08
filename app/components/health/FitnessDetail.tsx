import { fmtClock, fmtDate, fmtPace, fmtSigned } from '@/app/lib/health/format'
import type { FitnessAssessment } from '@/app/types/health'
import { Eyebrow, Stat, StatGrid, Table } from './primitives'

interface FitnessDetailProps {
  fitness: FitnessAssessment[]
}

export function FitnessDetail({ fitness }: FitnessDetailProps) {
  const sorted = [...fitness].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const latest = sorted[sorted.length - 1]
  if (!latest) return <div className="text-sm text-stone-400">No fitness assessment yet.</div>

  const deltaPace = first && latest.thresholdPaceSecPerKm && first.thresholdPaceSecPerKm ? latest.thresholdPaceSecPerKm - first.thresholdPaceSecPerKm : null

  return (
    <div className="space-y-10">
      <StatGrid>
        <Stat
          label="VO₂max"
          value={latest.vo2max?.toFixed(1) ?? '—'}
          sub={first && first !== latest && first.vo2max && latest.vo2max ? `${fmtSigned(latest.vo2max - first.vo2max, 1)} since Day 0` : `assessed ${fmtDate(latest.date)}`}
        />
        <Stat label="Threshold pace" value={fmtPace(latest.thresholdPaceSecPerKm)} sub={deltaPace !== null ? `${fmtSigned(deltaPace, 0, ' s/km')} since Day 0` : undefined} />
        <Stat label="Lactate threshold" value={latest.lactateThresholdHr ? `${latest.lactateThresholdHr} bpm` : '—'} />
        <Stat label="Fitness index" value={latest.fitnessIndex ?? '—'} sub="Coros running fitness" />
      </StatGrid>

      <div>
        <Eyebrow className="mb-3">Race predictions</Eyebrow>
        <Table
          caption="Race predictions by assessment"
          head={['Distance', ...sorted.map((f) => fmtDate(f.date)), sorted.length > 1 ? 'Δ' : '']}
          numeric={sorted.map((_, i) => i + 1).concat(sorted.length + 1)}
          rows={latest.racePredictions.map((p) => {
            const at = (f: FitnessAssessment) => f.racePredictions.find((r) => r.label === p.label)?.seconds ?? null
            const a = first ? at(first) : null
            const b = at(latest)
            return [
              p.label,
              ...sorted.map((f) => fmtClock(at(f))),
              sorted.length > 1 && a !== null && b !== null ? (
                <span key={p.label} className={b < a ? 'text-emerald-700' : b > a ? 'text-rose-700' : 'text-stone-400'}>
                  {b === a ? '0' : `${b < a ? '−' : '+'}${fmtClock(Math.abs(b - a))}`}
                </span>
              ) : (
                ''
              ),
            ]
          })}
        />
      </div>
    </div>
  )
}
