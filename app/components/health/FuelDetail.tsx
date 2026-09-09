import { avg, last, lastN } from '@/app/lib/health/derive'
import { fmtDate, fmtNumber } from '@/app/lib/health/format'
import type { FoodDay, NutritionTargets } from '@/app/types/health'
import { cn } from '@/app/lib/utils'
import { Eyebrow, Stat, StatGrid } from './primitives'
import { SparkBars } from './Sparkline'

interface FuelDetailProps {
  food: FoodDay[]
  targets: NutritionTargets
}

export function FuelDetail({ food, targets }: FuelDetailProps) {
  const week = lastN(food, 7)
  const month = lastN(food, 28)
  const calories = avg(week.map((d) => d.totals.calories))
  const protein = avg(week.map((d) => d.totals.proteinG))
  const carbs = avg(week.map((d) => d.totals.carbsG))
  const fat = avg(week.map((d) => d.totals.fatG))
  const proteinHits = month.filter((d) => d.totals.proteinG >= targets.proteinG * 0.95).length
  const latest = last(food)

  const vsTarget = (v: number | null, t: number) => (v === null ? undefined : `${v >= t ? '+' : '−'}${fmtNumber(Math.abs(v - t))} vs ${fmtNumber(t)} target`)

  return (
    <div className="space-y-10">
      <StatGrid>
        <Stat label="Calories, 7-day" value={fmtNumber(calories)} sub={vsTarget(calories, targets.calories)} />
        <Stat label="Protein" value={protein === null ? '—' : `${fmtNumber(protein)} g`} sub={vsTarget(protein, targets.proteinG)} />
        <Stat label="Carbs" value={carbs === null ? '—' : `${fmtNumber(carbs)} g`} sub={vsTarget(carbs, targets.carbsG)} />
        <Stat label="Fat" value={fat === null ? '—' : `${fmtNumber(fat)} g`} sub={vsTarget(fat, targets.fatG)} />
      </StatGrid>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Eyebrow className="mb-3">Calories · last 28 days</Eyebrow>
          <SparkBars values={month.map((d) => d.totals.calories)} width={280} height={44} floor="auto" className="h-11 w-full text-stone-900" />
          <div className="mt-1.5 flex justify-between text-[11px] text-stone-400">
            <span>{month[0] ? fmtDate(month[0].date) : ''}</span>
            <span>{latest ? fmtDate(latest.date) : ''}</span>
          </div>
        </div>
        <div>
          <Eyebrow className="mb-3">
            Protein target hit · {proteinHits} of {month.length} days
          </Eyebrow>
          <div className="grid grid-cols-14 gap-1.5">
            {month.map((d) => (
              <div
                key={d.date}
                title={`${fmtDate(d.date)} · ${d.totals.proteinG} g`}
                className={cn('aspect-square rounded-sm', d.totals.proteinG >= targets.proteinG * 0.95 ? 'bg-stone-900' : 'bg-stone-200')}
              />
            ))}
          </div>
        </div>
      </div>

      {latest && (
        <div>
          <Eyebrow className="mb-3">
            Logged {fmtDate(latest.date, 'EEEE')} · {fmtNumber(latest.totals.calories)} kcal · {latest.totals.proteinG} g protein
          </Eyebrow>
          <ul className="divide-y divide-stone-100 text-sm">
            {latest.entries.map((e) => (
              <li key={e.id} className="flex items-baseline gap-4 py-2.5">
                <span className="w-12 shrink-0 tabular-nums text-stone-400">{e.time ?? ''}</span>
                <span className="flex-1 text-stone-800">{e.description}</span>
                <span className="shrink-0 tabular-nums text-stone-500">
                  {fmtNumber(e.calories)} <span className="text-stone-400">kcal</span> · {e.proteinG} <span className="text-stone-400">g P</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-stone-400">Meals are logged in chat and parsed into these entries.</p>
        </div>
      )}
    </div>
  )
}
