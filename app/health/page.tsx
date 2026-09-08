import type { Metadata } from 'next'
import { getHealthSnapshot } from '@/app/lib/health/snapshot'
import { avg, getArc, getHeroNumbers, getLatestFocus, getMetricStrip, getPhaseState, getWeeklyDeltas, last, lastN } from '@/app/lib/health/derive'
import { fmtClock, fmtDate, fmtMass, fmtMassDelta, fmtMassValue, fmtMinutes, fmtNumber, fmtSigned, MASS_UNIT } from '@/app/lib/health/format'
import { BodyDetail } from '@/app/components/health/BodyDetail'
import { CheckinsDetail } from '@/app/components/health/CheckinsDetail'
import { DetailSection } from '@/app/components/health/DetailSection'
import { FitnessDetail } from '@/app/components/health/FitnessDetail'
import { FuelDetail } from '@/app/components/health/FuelDetail'
import { Loop } from '@/app/components/health/Loop'
import { MetricStrip } from '@/app/components/health/MetricStrip'
import { PhaseArc } from '@/app/components/health/PhaseArc'
import { PhotosDetail } from '@/app/components/health/PhotosDetail'
import { SleepDetail } from '@/app/components/health/SleepDetail'
import { TrainingDetail } from '@/app/components/health/TrainingDetail'
import { WeeklyLedger } from '@/app/components/health/WeeklyLedger'
import { Eyebrow } from '@/app/components/health/primitives'

export const metadata: Metadata = {
  title: 'Health — Yash Chitneni',
  description: 'A public body recomposition arc: add muscle, then cut fat. Measured with Coros, DEXA and a food log.',
}

export const revalidate = 3600

export default async function HealthPage() {
  const snapshot = await getHealthSnapshot()
  const phase = getPhaseState(snapshot)
  const arc = getArc(snapshot)
  const hero = getHeroNumbers(snapshot)
  const strip = getMetricStrip(snapshot)
  const focus = getLatestFocus(snapshot)
  const weeks = getWeeklyDeltas(snapshot)

  const sleepWeek = lastN(snapshot.sleep, 7)
  const sleepDuration = avg(sleepWeek.map((s) => s.durationMin))
  const sleepScore = avg(sleepWeek.map((s) => s.score))
  const todayLoad = last(snapshot.load)
  const weekSessions = snapshot.workouts.filter((w) => sleepWeek.some((s) => s.date === w.date)).length
  const latestFitness = last([...snapshot.fitness].sort((a, b) => a.date.localeCompare(b.date)))
  const fiveK = latestFitness?.racePredictions.find((r) => r.label === '5K')
  const foodWeek = lastN(snapshot.food, 7)
  const kcal = avg(foodWeek.map((d) => d.totals.calories))
  const protein = avg(foodWeek.map((d) => d.totals.proteinG))
  const energy = avg(lastN(snapshot.checkins, 7).map((c) => c.energy))
  const frontPhotos = snapshot.photos.filter((p) => p.pose === 'front').length

  // The hero follows the best available story: change through the arc once a
  // second scan exists; until then, Day 0 against the last visit; failing
  // that, the starting point itself.
  const heroValue =
    hero.mode === 'arc' && hero.sinceDayZero
      ? fmtMassDelta(hero.sinceDayZero.leanKg, 1, false)
      : hero.mode === 'history' && hero.vsPrevious
        ? fmtMassDelta(hero.vsPrevious.fatKg, 1, false)
        : hero.dayZero
          ? fmtMassValue(hero.dayZero.leanMassKg)
          : fmtMassDelta(hero.weightDeltaKg, 1, false)
  const heroLabel =
    hero.mode === 'arc'
      ? `${MASS_UNIT} lean mass since Day 0`
      : hero.mode === 'history' && hero.vsPrevious
        ? `${MASS_UNIT} of fat since the last scan, ${hero.vsPrevious.from.label ?? fmtDate(hero.vsPrevious.from.date, 'MMM yyyy')}`
        : hero.mode === 'baseline'
          ? `${MASS_UNIT} lean mass at Day 0. The number to move first.`
          : `${MASS_UNIT} since Day 0`
  const updated = last(snapshot.vitals)?.date ?? snapshot.today

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 md:px-10 md:pt-20">
      {/* header */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <Eyebrow className="text-stone-900">
          Health <span className="text-stone-300">/</span> <span className="text-stone-500">Recomp arc</span>
        </Eyebrow>
        <Eyebrow className="text-stone-400">
          Updated {fmtDate(updated, 'MMM d')}
          <span className="hidden sm:inline"> · Coros · DEXA · chat log</span>
          {snapshot.source === 'fixtures' && <span className="ml-3 rounded-full border border-stone-300 px-2 py-0.5 text-[10px] text-stone-500">preview data</span>}
        </Eyebrow>
      </header>

      {/* hero */}
      <section className="mt-16 md:mt-24" aria-label="Headline">
        <p className="text-sm text-stone-500">
          {phase.current ? (
            <>
              Phase {snapshot.phases.findIndex((p) => p.id === phase.current!.id) + 1} of {snapshot.phases.length} · <span className="text-stone-900">{phase.current.label}</span>, week {phase.week} of{' '}
              {phase.current.plannedWeeks}
            </>
          ) : (
            'Not in a phase yet'
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h1 className="font-display text-[5.5rem] font-light leading-none tracking-[-0.04em] tabular-nums text-stone-900 md:text-[9rem]">{heroValue}</h1>
          <p className="max-w-[16rem] text-lg leading-snug text-stone-500 md:text-xl">{heroLabel}</p>
        </div>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          {hero.mode === 'arc' && hero.sinceDayZero && (
            <>
              <Fact label="Fat mass" value={fmtMassDelta(hero.sinceDayZero.fatKg)} />
              <Fact label="Body fat" value={`${hero.sinceDayZero.to.bodyFatPct.toFixed(1)}%`} sub={fmtSigned(hero.sinceDayZero.bodyFatPct, 1, ' pts')} />
              <Fact label="Weight" value={fmtMass(hero.weightNowKg)} sub={fmtMassDelta(hero.weightDeltaKg)} />
            </>
          )}
          {hero.mode === 'history' && hero.vsPrevious && hero.dayZero && (
            <>
              <Fact label="Lean mass" value={fmtMass(hero.dayZero.leanMassKg)} sub={fmtMassDelta(hero.vsPrevious.leanKg)} />
              <Fact label="Body fat" value={`${hero.dayZero.bodyFatPct.toFixed(1)}%`} sub={fmtSigned(hero.vsPrevious.bodyFatPct, 1, ' pts')} />
              <Fact label="Weight" value={fmtMass(hero.dayZero.weightKg)} sub={fmtMassDelta(hero.vsPrevious.weightKg)} />
              {hero.vsFirst && hero.vsFirst.from !== hero.vsPrevious.from && (
                <Fact
                  label={`Since ${hero.vsFirst.from.label ?? fmtDate(hero.vsFirst.from.date, 'MMM yyyy')}`}
                  value={`fat ${fmtMassDelta(hero.vsFirst.fatKg)} · lean ${fmtMassDelta(hero.vsFirst.leanKg)} · ${fmtSigned(hero.vsFirst.bodyFatPct, 1, ' pts')}`}
                  muted
                />
              )}
            </>
          )}
          {hero.mode === 'baseline' && hero.dayZero && (
            <>
              <Fact label="Fat mass" value={fmtMass(hero.dayZero.fatMassKg)} />
              <Fact label="Body fat" value={`${hero.dayZero.bodyFatPct.toFixed(1)}%`} />
              <Fact label="Weight" value={fmtMass(hero.dayZero.weightKg)} />
              {hero.dayZero.rmrKcal && <Fact label="RMR" value={`${fmtNumber(hero.dayZero.rmrKcal)} kcal`} />}
            </>
          )}
          {phase.current && <Fact label="Goal" value={phase.current.goal} muted />}
        </dl>
        <PhaseArc arc={arc} phase={phase} />
      </section>

      {/* signals */}
      <div className="mt-20 md:mt-28">
        <MetricStrip metrics={strip} />
      </div>

      {/* loop */}
      <div className="mt-20 md:mt-28">
        <Loop focus={focus} />
      </div>

      {/* detail on demand */}
      <div className="mt-20 border-b border-stone-200 md:mt-28">
        <DetailSection
          id="body"
          title="Body"
          headline={fmtMass(hero.weightNowKg)}
          aside={
            hero.latest
              ? `${fmtMass(hero.latest.leanMassKg)} lean · ${fmtMass(hero.latest.fatMassKg)} fat · ${snapshot.compositions.length} DEXA scan${snapshot.compositions.length === 1 ? '' : 's'}`
              : undefined
          }
          defaultOpen
        >
          <BodyDetail hero={hero} compositions={snapshot.compositions} bodyProfile={snapshot.bodyProfile} />
        </DetailSection>

        <DetailSection id="sleep" title="Sleep" headline={fmtMinutes(sleepDuration)} aside={`score ${fmtNumber(sleepScore)} · HRV ${strip.find((m) => m.key === 'hrv')?.display ?? '—'} ms`}>
          <SleepDetail sleep={snapshot.sleep} />
        </DetailSection>

        <DetailSection
          id="training"
          title="Training"
          headline={`${weekSessions} session${weekSessions === 1 ? '' : 's'}`}
          aside={todayLoad ? `7-day load ${fmtNumber(todayLoad.shortTerm)} · ratio ${todayLoad.ratio.toFixed(2)} · ${todayLoad.status}` : undefined}
        >
          <TrainingDetail load={snapshot.load} workouts={snapshot.workouts} vitals={snapshot.vitals} />
        </DetailSection>

        <DetailSection
          id="fitness"
          title="Fitness"
          headline={latestFitness?.vo2max ? `VO₂max ${latestFitness.vo2max.toFixed(1)}` : '—'}
          aside={fiveK ? `5K ${fmtClock(fiveK.seconds)} predicted` : undefined}
        >
          <FitnessDetail fitness={snapshot.fitness} />
        </DetailSection>

        <DetailSection id="fuel" title="Fuel" headline={kcal === null ? '—' : `${fmtNumber(kcal)} kcal`} aside={protein === null ? undefined : `${fmtNumber(protein)} g protein · target ${snapshot.targets.proteinG} g`}>
          <FuelDetail food={snapshot.food} targets={snapshot.targets} />
        </DetailSection>

        <DetailSection
          id="photos"
          title="Photos"
          headline={phase.week <= 1 ? 'Day 0' : `Week ${phase.week - 1}`}
          aside={`${frontPhotos} weekly check-in${frontPhotos === 1 ? '' : 's'}`}
        >
          <PhotosDetail photos={snapshot.photos} dayZero={hero.dayZero?.date ?? phase.current?.startDate ?? null} />
        </DetailSection>

        <DetailSection id="checkins" title="Check-ins" headline={energy === null ? '—' : `Energy ${energy.toFixed(1)}`} aside="9 self-report scores, 1–5">
          <CheckinsDetail checkins={snapshot.checkins} />
        </DetailSection>
      </div>

      {/* week by week */}
      <div className="mt-20 md:mt-28">
        <WeeklyLedger weeks={weeks} />
      </div>

      {/* provenance */}
      <footer className="mt-20 grid gap-6 border-t border-stone-200 pt-8 text-xs text-stone-500 md:mt-28 md:grid-cols-4">
        <div>
          <Eyebrow className="mb-1.5">Coros</Eyebrow>
          Sleep, HRV, recovery, resting HR, stress, training load, fitness, workouts, weight.
        </div>
        <div>
          <Eyebrow className="mb-1.5">DEXA</Eyebrow>
          Lean, fat and bone mass, regional fat, lean balance. The arc is measured on one machine (GE Lunar Prodigy, ARC South 1st): Day 0, then every 8 weeks. Earlier scans from other facilities are shown for context only.
        </div>
        <div>
          <Eyebrow className="mb-1.5">Food log</Eyebrow>
          Meals typed into chat, parsed to calories and macros.
        </div>
        <div>
          <Eyebrow className="mb-1.5">Check-ins</Eyebrow>
          Nine 1–5 scores each morning. Photos weekly, fasted.
        </div>
      </footer>
    </main>
  )
}

function Fact({ label, value, sub, muted }: { label: string; value: string; sub?: string; muted?: boolean }) {
  return (
    <div className={muted ? 'basis-full md:basis-auto md:max-w-sm' : undefined}>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-stone-400">{label}</dt>
      <dd className={muted ? 'mt-0.5 text-stone-600' : 'mt-0.5 tabular-nums text-stone-900'}>
        {value}
        {sub && <span className="ml-2 text-stone-400">{sub}</span>}
      </dd>
    </div>
  )
}
