import type { HeroNumbers } from '@/app/lib/health/derive'
import { fmtDate, fmtNumber, fmtSigned } from '@/app/lib/health/format'
import { LB_PER_KG } from '@/app/lib/health/data/dexa-2026-09-08-arc'
import type { BodyComposition, BodyProfile, DexaRegion } from '@/app/types/health'
import { cn } from '@/app/lib/utils'
import { Eyebrow, Stat, StatGrid, Table } from './primitives'
import { TrendChart } from './TrendChart'

interface BodyDetailProps {
  hero: HeroNumbers
  compositions: BodyComposition[]
  bodyProfile: BodyProfile[]
}

const REGION_LABELS: Record<DexaRegion, string> = {
  arms: 'Arms',
  legs: 'Legs',
  trunk: 'Trunk',
  android: 'Android (waist)',
  gynoid: 'Gynoid (hip)',
}

/** kg with the report's pounds alongside, since scans in the US print in lb */
function KgLb({ kg, dp = 1 }: { kg: number | null; dp?: number }) {
  if (kg === null) return <>—</>
  return (
    <>
      {fmtNumber(kg, dp)} kg <span className="text-stone-400">{fmtNumber(kg * LB_PER_KG, dp)} lb</span>
    </>
  )
}

export function BodyDetail({ hero, compositions, bodyProfile }: BodyDetailProps) {
  const scans = [...compositions].sort((a, b) => a.date.localeCompare(b.date))
  const first = scans[0]
  const latest = scans[scans.length - 1]
  const multi = scans.length > 1

  type Unit = 'kg' | '%' | 'g'
  type MassRow = [label: string, pick: (s: BodyComposition) => number | null, dp: number, unit: Unit]
  const allRows: MassRow[] = [
    ['Weight', (s) => s.weightKg, 1, 'kg'],
    ['Lean mass', (s) => s.leanMassKg, 1, 'kg'],
    ['Fat mass', (s) => s.fatMassKg, 1, 'kg'],
    ['Bone mass', (s) => s.boneMassKg, 1, 'kg'],
    ['Body fat', (s) => s.bodyFatPct, 1, '%'],
    ['Visceral fat', (s) => s.visceralFatG, 0, 'g'],
  ]
  // hide rows no scan reports (e.g. GE Lunar Prodigy has no visceral fat estimate)
  const massRows = allRows.filter(([, pick]) => scans.some((s) => pick(s) !== null))

  const cell = (v: number | null, dp: number, unit: Unit) => {
    if (v === null) return '—'
    if (unit === 'kg') return <KgLb kg={v} dp={dp} />
    return `${fmtNumber(v, dp)}${unit === '%' ? '%' : ' g'}`
  }

  const regions = (Object.keys(REGION_LABELS) as DexaRegion[]).filter((r) => latest?.regional?.[r])
  const symmetry = latest?.symmetry

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

      {hero.mode === 'delta' ? (
        <StatGrid>
          <Stat label="Lean since Day 0" value={fmtSigned(hero.leanDeltaKg, 1, ' kg')} sub={latest ? `as of ${fmtDate(latest.date)}` : undefined} />
          <Stat label="Fat since Day 0" value={fmtSigned(hero.fatDeltaKg, 1, ' kg')} />
          <Stat label="Body fat" value={latest ? `${latest.bodyFatPct.toFixed(1)}%` : '—'} sub={fmtSigned(hero.bodyFatDeltaPct, 1, ' pts')} />
          <Stat label="Weight, 7-day" value={hero.weightNowKg ? `${hero.weightNowKg.toFixed(1)} kg` : '—'} sub={`${fmtSigned(hero.weightDeltaKg, 1, ' kg')} since Day 0`} />
        </StatGrid>
      ) : (
        latest && (
          <StatGrid>
            <Stat label="Tissue lean" value={latest.tissueLeanPct !== null ? `${latest.tissueLeanPct.toFixed(1)}%` : '—'} sub="lean ÷ (lean + fat)" />
            <Stat label="RMR" value={latest.rmrKcal ? `${fmtNumber(latest.rmrKcal)} kcal` : '—'} sub="Harris-Benedict, per report" />
            <Stat label="RSMI" value={latest.rsmiKgM2 !== null ? `${latest.rsmiKgM2.toFixed(2)} kg/m²` : '—'} sub="appendicular lean ÷ height²" />
            <Stat label="Android / gynoid" value={latest.androidGynoidRatio !== null ? latest.androidGynoidRatio.toFixed(2) : '—'} sub="waist-to-hip fat ratio" />
          </StatGrid>
        )
      )}

      {scans.length > 0 && (
        <div>
          <Eyebrow className="mb-3">
            DEXA
            {latest.facility && <span className="text-stone-400"> · {latest.device ? `${latest.device}, ` : ''}{latest.facility}</span>}
          </Eyebrow>
          <Table
            caption="DEXA scans"
            head={['', ...scans.map((s) => `${s.label ?? 'Scan'} · ${fmtDate(s.date)}`), multi ? 'Δ' : '']}
            numeric={scans.map((_, i) => i + 1).concat(scans.length + 1)}
            rows={massRows.map(([label, pick, dp, unit]) => {
              const a = first ? pick(first) : null
              const b = latest ? pick(latest) : null
              return [
                label,
                ...scans.map((s) => cell(pick(s), dp, unit)),
                multi && a !== null && b !== null ? fmtSigned(b - a, dp, unit === '%' ? ' pts' : ` ${unit}`) : '',
              ]
            })}
          />
        </div>
      )}

      {latest && (regions.length > 0 || symmetry) && (
        <div className="grid gap-10 md:grid-cols-2">
          {regions.length > 0 && (
            <div>
              <Eyebrow className="mb-3">Where the fat is · % fat by region</Eyebrow>
              <ul className="space-y-3">
                {regions.map((r) => {
                  const pct = latest.regional![r]!.fatPct
                  const lean = latest.regional![r]!.leanKg
                  const isPeak = pct !== null && pct === Math.max(...regions.map((x) => latest.regional![x]!.fatPct ?? -1))
                  return (
                    <li key={r}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className={cn('text-stone-600', isPeak && 'text-stone-900')}>{REGION_LABELS[r]}</span>
                        <span className="tabular-nums text-stone-900">
                          {pct !== null ? `${pct.toFixed(1)}%` : '—'}
                          {lean !== null && <span className="ml-2 text-xs text-stone-400">{lean.toFixed(1)} kg lean</span>}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-stone-200">
                        <div className={cn('h-1 rounded-full', isPeak ? 'bg-stone-900' : 'bg-stone-500')} style={{ width: `${Math.min(100, ((pct ?? 0) / 40) * 100)}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-xs text-stone-400">Bars scaled to 40% fat.</p>
            </div>
          )}

          {symmetry && (
            <div>
              <Eyebrow className="mb-3">Lean balance · left vs right</Eyebrow>
              <Table
                compact
                caption="Lean mass balance"
                head={['', 'Left', 'Right', 'Δ']}
                numeric={[1, 2, 3]}
                rows={(['arms', 'legs', 'trunk', 'total'] as const).map((part) => {
                  const s = symmetry[part]
                  const d = s.rightKg - s.leftKg
                  return [
                    part === 'total' ? 'Total' : REGION_LABELS[part],
                    `${s.leftKg.toFixed(1)} kg`,
                    `${s.rightKg.toFixed(1)} kg`,
                    <span key={part} className={Math.abs(d) < 0.05 ? 'text-stone-400' : 'text-stone-700'}>
                      {fmtSigned(d, 1, ' kg')}
                    </span>,
                  ]
                })}
              />
              <p className="mt-3 text-xs text-stone-400">Positive Δ means the right side carries more lean mass.</p>
            </div>
          )}
        </div>
      )}

      {latest?.notes && <p className="text-xs text-stone-500">{latest.notes}</p>}
    </div>
  )
}
