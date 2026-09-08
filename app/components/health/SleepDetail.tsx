import { avg, lastN } from '@/app/lib/health/derive'
import { fmtDate, fmtMinutes, fmtNumber } from '@/app/lib/health/format'
import type { SleepNight } from '@/app/types/health'
import { Eyebrow, Stat, StatGrid } from './primitives'
import { TrendChart } from './TrendChart'

interface SleepDetailProps {
  sleep: SleepNight[]
}

const STAGES: Array<{ key: keyof Pick<SleepNight, 'deepMin' | 'remMin' | 'lightMin' | 'awakeMin'>; label: string; tone: string }> = [
  { key: 'deepMin', label: 'Deep', tone: 'bg-stone-900' },
  { key: 'remMin', label: 'REM', tone: 'bg-stone-600' },
  { key: 'lightMin', label: 'Light', tone: 'bg-stone-300' },
  { key: 'awakeMin', label: 'Awake', tone: 'bg-stone-200' },
]

export function SleepDetail({ sleep }: SleepDetailProps) {
  const week = lastN(sleep, 7)
  const month = lastN(sleep, 28)
  const duration = avg(week.map((s) => s.durationMin))
  const score = avg(week.map((s) => s.score))
  const hrv = avg(week.map((s) => s.hrvMs))
  const lowestHr = avg(week.map((s) => s.lowestHr))
  const stageAvg = STAGES.map((st) => ({ ...st, minutes: avg(month.map((s) => s[st.key])) ?? 0 }))
  const stageTotal = stageAvg.reduce((a, s) => a + s.minutes, 0) || 1
  const under7 = week.filter((s) => s.durationMin < 420).length

  return (
    <div className="space-y-10">
      <StatGrid>
        <Stat label="Duration, 7-night" value={fmtMinutes(duration)} sub={under7 ? `${under7} night${under7 > 1 ? 's' : ''} under 7h` : 'every night over 7h'} />
        <Stat label="Score" value={fmtNumber(score)} sub="Coros sleep score" />
        <Stat label="Sleep HRV" value={hrv === null ? '—' : `${fmtNumber(hrv)} ms`} sub="overnight rMSSD" />
        <Stat label="Lowest HR" value={lowestHr === null ? '—' : `${fmtNumber(lowestHr)} bpm`} />
      </StatGrid>

      <div>
        <Eyebrow className="mb-3">Stages · 28-night average</Eyebrow>
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          {stageAvg.map((s) => (
            <div key={s.key} className={s.tone} style={{ width: `${(s.minutes / stageTotal) * 100}%` }} title={`${s.label} ${fmtMinutes(s.minutes)}`} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-600">
          {stageAvg.map((s) => (
            <span key={s.key} className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${s.tone}`} />
              {s.label} <span className="tabular-nums text-stone-900">{fmtMinutes(s.minutes)}</span>
              <span className="tabular-nums text-stone-400">{Math.round((s.minutes / stageTotal) * 100)}%</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <Eyebrow className="mb-4">Sleep HRV · nightly, 7-night average in ink</Eyebrow>
        <TrendChart points={sleep.map((s) => ({ date: s.date, value: s.hrvMs }))} format={(v) => `${Math.round(v)} ms`} />
      </div>

      <div>
        <Eyebrow className="mb-3">Last 14 nights</Eyebrow>
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
          {lastN(sleep, 14).map((n) => {
            const total = n.durationMin || 1
            return (
              <div key={n.date} className="flex flex-col items-center gap-1.5" title={`${fmtDate(n.date)} · ${fmtMinutes(n.durationMin)} · score ${n.score ?? '—'}`}>
                <div className="flex h-16 w-full flex-col-reverse overflow-hidden rounded-sm bg-stone-100">
                  {STAGES.filter((s) => s.key !== 'awakeMin').map((s) => (
                    <div key={s.key} className={s.tone} style={{ height: `${(n[s.key] / total) * 100 * (n.durationMin / 540)}%` }} />
                  ))}
                </div>
                <span className="text-[10px] tabular-nums text-stone-400">{fmtDate(n.date, 'd')}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
