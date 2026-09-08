import { last, lastN, sum } from '@/app/lib/health/derive'
import { fmtClock, fmtDate, fmtKm, fmtNumber, fmtPace, SPORT_LABELS } from '@/app/lib/health/format'
import type { DailyVitals, TrainingLoadDay, Workout } from '@/app/types/health'
import { Eyebrow, Stat, StatGrid, Table } from './primitives'
import { SparkBars } from './Sparkline'

interface TrainingDetailProps {
  load: TrainingLoadDay[]
  workouts: Workout[]
  vitals: DailyVitals[]
}

const LOAD_STATUS: Record<TrainingLoadDay['status'], string> = {
  detraining: 'detraining',
  maintaining: 'maintaining',
  optimal: 'optimal',
  high: 'high',
  overreaching: 'overreaching',
}

const RECOVERY: Record<NonNullable<DailyVitals['recoveryStatus']>, string> = {
  full: 'fully recovered',
  good: 'well recovered',
  partial: 'partially recovered',
  low: 'low',
}

export function TrainingDetail({ load, workouts, vitals }: TrainingDetailProps) {
  const today = last(load)
  const month = lastN(load, 28)
  const weekSessions = workouts.filter((w) => month.slice(-7).some((d) => d.date === w.date))
  const recent = [...workouts].sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 7)
  const todayVitals = last(vitals)
  const stress = lastN(vitals, 7).map((v) => v.stressAvg)
  const stressAvg = stress.length ? sum(stress) / stress.length : null

  return (
    <div className="space-y-10">
      <StatGrid>
        <Stat label="7-day load" value={fmtNumber(today?.shortTerm)} sub={`42-day avg ${fmtNumber(today?.longTerm)}`} />
        <Stat label="Load ratio" value={today ? today.ratio.toFixed(2) : '—'} sub={today ? LOAD_STATUS[today.status] : undefined} />
        <Stat
          label="Recovery"
          value={todayVitals?.recoveryPct === null || todayVitals?.recoveryPct === undefined ? '—' : `${todayVitals.recoveryPct}%`}
          sub={todayVitals?.recoveryStatus ? RECOVERY[todayVitals.recoveryStatus] : undefined}
        />
        <Stat label="Stress, 7-day" value={fmtNumber(stressAvg)} sub={`${weekSessions.length} session${weekSessions.length === 1 ? '' : 's'} this week`} />
      </StatGrid>

      <div>
        <Eyebrow className="mb-3">Daily load · last 28 days</Eyebrow>
        <SparkBars values={month.map((d) => d.dailyLoad)} width={560} height={48} className="h-12 w-full text-stone-900" />
        <div className="mt-1.5 flex justify-between text-[11px] text-stone-400">
          <span>{month[0] ? fmtDate(month[0].date) : ''}</span>
          <span>{today ? fmtDate(today.date) : ''}</span>
        </div>
      </div>

      <div>
        <Eyebrow className="mb-3">Recent sessions</Eyebrow>
        <Table
          caption="Recent workouts"
          head={['Date', 'Session', 'Time', 'Distance', 'Pace', 'Avg HR', 'Load']}
          numeric={[2, 3, 4, 5, 6]}
          rows={recent.map((w) => [
            fmtDate(w.date, 'EEE d'),
            <span key={w.id} className="text-stone-900">
              <span className="text-stone-400">{SPORT_LABELS[w.sport]} · </span>
              {w.title}
            </span>,
            fmtClock(w.durationSec),
            w.distanceM ? fmtKm(w.distanceM) : '—',
            w.avgPaceSecPerKm ? fmtPace(w.avgPaceSecPerKm) : '—',
            w.avgHr ?? '—',
            w.trainingLoad ?? '—',
          ])}
        />
      </div>
    </div>
  )
}
