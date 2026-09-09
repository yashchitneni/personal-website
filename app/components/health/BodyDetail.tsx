import type { HeroNumbers } from '@/app/lib/health/derive'
import { fmtDate, fmtMass, fmtMassDelta, fmtNumber, fmtSigned, MASS_UNIT } from '@/app/lib/health/format'
import type { BodyComposition, BodyProfile, DexaRegion } from '@/app/types/health'
import { cn } from '@/app/lib/utils'
import { CompositionTimeline } from './CompositionTimeline'
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

type Unit = 'mass' | '%' | 'g' | 'kcal' | 'ratio'
type Row = [label: string, pick: (s: BodyComposition) => number | null, dp: number, unit: Unit]

const ALL_ROWS: Row[] = [
  ['Weight', (s) => s.weightKg, 1, 'mass'],
  ['Lean mass', (s) => s.leanMassKg, 1, 'mass'],
  ['Fat mass', (s) => s.fatMassKg, 1, 'mass'],
  ['Bone mass', (s) => s.boneMassKg, 1, 'mass'],
  ['Body fat', (s) => s.bodyFatPct, 1, '%'],
  ['Visceral fat', (s) => s.visceralFatG, 0, 'g'],
  ['Android / gynoid', (s) => s.androidGynoidRatio, 2, 'ratio'],
  ['RMR', (s) => s.rmrKcal, 0, 'kcal'],
]

function cell(v: number | null, dp: number, unit: Unit) {
  if (v === null) return '—'
  switch (unit) {
    case 'mass':
      return fmtMass(v, dp)
    case '%':
      return `${fmtNumber(v, dp)}%`
    case 'g':
      return `${fmtNumber(v, dp)} g`
    case 'kcal':
      return `${fmtNumber(v, dp)} kcal`
    case 'ratio':
      return fmtNumber(v, dp)
  }
}

function deltaCell(d: number, dp: number, unit: Unit) {
  switch (unit) {
    case 'mass':
      return fmtMassDelta(d, dp)
    case '%':
      return fmtSigned(d, dp, ' pts')
    case 'g':
      return fmtSigned(d, dp, ' g')
    case 'kcal':
      return fmtSigned(d, dp, ' kcal')
    case 'ratio':
      return fmtSigned(d, dp)
  }
}

export function BodyDetail({ hero, compositions, bodyProfile }: BodyDetailProps) {
  const scans = [...compositions].sort((a, b) => a.date.localeCompare(b.date))
  const latest = scans[scans.length - 1]
  const previous = scans.length > 1 ? scans[scans.length - 2] : null
  const rows = ALL_ROWS.filter(([, pick]) => scans.some((s) => pick(s) !== null))
  const machines = Array.from(new Set(scans.map((s) => `${s.facility ?? '?'}|${s.device ?? ''}`)))
  const crossMachine = machines.length > 1

  const regions = (Object.keys(REGION_LABELS) as DexaRegion[]).filter((r) => latest?.regional?.[r])
  const symmetry = latest?.symmetry
  const arcScans = hero.dayZero ? scans.filter((s) => s.date >= hero.dayZero!.date) : scans

  return (
    <div className="space-y-10">
      {scans.length > 1 && (
        <div>
          <Eyebrow className="mb-2">Every scan on record</Eyebrow>
          <CompositionTimeline scans={scans} dayZero={hero.dayZero} />
          {crossMachine && (
            <p className="mt-6 text-xs text-stone-400">
              Hollow points are other facilities and machines ({machines.length} in total). DEXA models differ by roughly a percentage point of body fat, so
              steps between them are directional; the arc is measured only on {hero.dayZero?.device ?? 'the Day 0 machine'}.
            </p>
          )}
        </div>
      )}

      <div>
        <Eyebrow className="mb-4">Daily weight · 7-day average in ink, scans marked</Eyebrow>
        <TrendChart
          points={bodyProfile.map((b) => ({ date: b.date, value: b.weightKg }))}
          markers={arcScans.map((s) => ({ date: s.date, label: s.label ?? 'Scan' }))}
          format={(v) => fmtMass(v)}
        />
      </div>

      {hero.mode === 'arc' && hero.sinceDayZero ? (
        <StatGrid>
          <Stat label="Lean since Day 0" value={fmtMassDelta(hero.sinceDayZero.leanKg)} sub={`as of ${fmtDate(hero.sinceDayZero.to.date)}`} />
          <Stat label="Fat since Day 0" value={fmtMassDelta(hero.sinceDayZero.fatKg)} />
          <Stat label="Body fat" value={`${hero.sinceDayZero.to.bodyFatPct.toFixed(1)}%`} sub={fmtSigned(hero.sinceDayZero.bodyFatPct, 1, ' pts')} />
          <Stat label="Weight, 7-day" value={fmtMass(hero.weightNowKg)} sub={`${fmtMassDelta(hero.weightDeltaKg)} since Day 0`} />
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
            {latest.facility && (
              <span className="text-stone-400">
                {' '}
                · Day 0 on {latest.device ? `${latest.device}, ` : ''}
                {latest.facility}
              </span>
            )}
          </Eyebrow>
          <Table
            caption="DEXA scans"
            head={[
              '',
              // month-year labels already say when; only named scans ("Day 0") need the date spelled out
              ...scans.map((s) => (s.label && !/^[A-Z][a-z]{2} \d{4}$/.test(s.label) ? `${s.label} · ${fmtDate(s.date, 'MMM d, yyyy')}` : fmtDate(s.date, 'MMM d, yyyy'))),
              previous ? `Δ vs ${previous.label ?? 'previous'}` : '',
            ]}
            numeric={scans.map((_, i) => i + 1).concat(scans.length + 1)}
            rows={rows.map(([label, pick, dp, unit]) => {
              const a = previous ? pick(previous) : null
              const b = latest ? pick(latest) : null
              return [
                label,
                ...scans.map((s, i) => (
                  <span key={s.id} className={cn(i !== scans.length - 1 && 'text-stone-500')}>
                    {cell(pick(s), dp, unit)}
                  </span>
                )),
                previous && a !== null && b !== null ? deltaCell(b - a, dp, unit) : '',
              ]
            })}
          />
          {latest?.weightKg !== latest?.totalMassKg && latest?.totalMassKg && (
            <p className="mt-3 text-xs text-stone-400">
              Weight is the scale reading at the scan; the scan itself measured {fmtMass(latest.totalMassKg)} of tissue.
            </p>
          )}
        </div>
      )}

      {latest && (regions.length > 0 || symmetry) && (
        <div className="grid gap-10 md:grid-cols-2">
          {regions.length > 0 && (
            <div>
              <Eyebrow className="mb-3">Where the fat is · % fat by region, Day 0</Eyebrow>
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
                          {lean !== null && <span className="ml-2 text-xs text-stone-400">{fmtMass(lean)} lean</span>}
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
              <Eyebrow className="mb-3">Lean balance · left vs right, Day 0</Eyebrow>
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
                    fmtMass(s.leftKg),
                    fmtMass(s.rightKg),
                    <span key={part} className={Math.abs(d) < 0.05 ? 'text-stone-400' : 'text-stone-700'}>
                      {fmtMassDelta(d)}
                    </span>,
                  ]
                })}
              />
              <p className="mt-3 text-xs text-stone-400">Positive Δ means the right side carries more lean mass. Values in {MASS_UNIT}.</p>
            </div>
          )}
        </div>
      )}

      {latest?.notes && <p className="text-xs text-stone-500">{latest.notes}</p>}
    </div>
  )
}
