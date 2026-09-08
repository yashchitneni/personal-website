import type { HeroNumbers } from '@/app/lib/health/derive'
import { fmtDate, fmtNumber, fmtSigned } from '@/app/lib/health/format'
import type { BodyComposition, BodyProfile } from '@/app/types/health'
import { Eyebrow, Stat, StatGrid, Table } from './primitives'
import { TrendChart } from './TrendChart'

interface BodyDetailProps {
  hero: HeroNumbers
  compositions: BodyComposition[]
  bodyProfile: BodyProfile[]
}

export function BodyDetail({ hero, compositions, bodyProfile }: BodyDetailProps) {
  const scans = [...compositions].sort((a, b) => a.date.localeCompare(b.date))
  const first = scans[0]
  const latest = scans[scans.length - 1]

  const rows: Array<[string, (s: BodyComposition) => number | null, number, string]> = [
    ['Weight', (s) => s.weightKg, 1, ' kg'],
    ['Lean mass', (s) => s.leanMassKg, 1, ' kg'],
    ['Fat mass', (s) => s.fatMassKg, 1, ' kg'],
    ['Body fat', (s) => s.bodyFatPct, 1, '%'],
    ['Visceral fat', (s) => s.visceralFatG, 0, ' g'],
    ['Bone mass', (s) => s.boneMassKg, 1, ' kg'],
  ]

  return (
    <div className="space-y-10">
      <div>
        <Eyebrow className="mb-4">Daily weight · 7-day average in ink, scans marked</Eyebrow>
        <TrendChart
          points={bodyProfile.map((b) => ({ date: b.date, value: b.weightKg }))}
          markers={scans.map((s) => ({ date: s.date, label: s.label ?? 'Scan' }))}
          format={(v) => `${v.toFixed(1)} kg`}
        />
      </div>

      <StatGrid>
        <Stat label="Lean since Day 0" value={fmtSigned(hero.leanDeltaKg, 1, ' kg')} sub={latest ? `as of ${fmtDate(latest.date)}` : undefined} />
        <Stat label="Fat since Day 0" value={fmtSigned(hero.fatDeltaKg, 1, ' kg')} />
        <Stat label="Body fat" value={latest ? `${latest.bodyFatPct.toFixed(1)}%` : '—'} sub={fmtSigned(hero.bodyFatDeltaPct, 1, ' pts')} />
        <Stat label="Weight, 7-day" value={hero.weightNowKg ? `${hero.weightNowKg.toFixed(1)} kg` : '—'} sub={`${fmtSigned(hero.weightDeltaKg, 1, ' kg')} since Day 0`} />
      </StatGrid>

      {scans.length > 0 && (
        <div>
          <Eyebrow className="mb-3">DEXA</Eyebrow>
          <Table
            caption="DEXA scans"
            head={['', ...scans.map((s) => `${s.label ?? 'Scan'} · ${fmtDate(s.date)}`), scans.length > 1 ? 'Δ' : '']}
            numeric={scans.map((_, i) => i + 1).concat(scans.length + 1)}
            rows={rows.map(([label, pick, dp, unit]) => {
              const a = first ? pick(first) : null
              const b = latest ? pick(latest) : null
              return [
                label,
                ...scans.map((s) => {
                  const v = pick(s)
                  return v === null ? '—' : `${fmtNumber(v, dp)}${unit}`
                }),
                scans.length > 1 && a !== null && b !== null ? fmtSigned(b - a, dp, unit) : '',
              ]
            })}
          />
          {latest?.regional && first?.regional && (
            <p className="mt-4 text-xs text-stone-500">
              Regional lean, Day 0 → {latest.label ?? 'latest'}: trunk {fmtSigned(latest.regional.trunk.leanKg - first.regional.trunk.leanKg, 1, ' kg')}, arms{' '}
              {fmtSigned(latest.regional.arms.leanKg - first.regional.arms.leanKg, 1, ' kg')}, legs{' '}
              {fmtSigned(latest.regional.legs.leanKg - first.regional.legs.leanKg, 1, ' kg')}.
              {latest.notes ? ` ${latest.notes}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
