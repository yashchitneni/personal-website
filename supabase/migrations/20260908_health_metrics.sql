-- Health warehouse behind /health.
-- Additive: new health_* tables only. Existing biofeedback / daily_aggregations
-- tables are left untouched; health_checkins is the typed successor and can be
-- backfilled from daily_aggregations.metrics (see note at the bottom).
--
-- Write path: service role only, via POST /api/health/ingest.
-- Read path: anon select (the page is public).

-- ---------------------------------------------------------------- phases
create table if not exists health_phases (
  id            text primary key,
  kind          text not null check (kind in ('build', 'cut', 'maintain')),
  label         text not null,
  start_date    date not null,
  end_date      date,
  planned_weeks integer not null,
  goal          text not null default '',
  synced_at     timestamptz not null default now()
);

create table if not exists health_focus_notes (
  week_start date primary key,
  measured   text not null default '',
  noticed    text not null default '',
  action     text not null default '',
  synced_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- coros
create table if not exists health_sleep (
  date         date primary key,
  score        integer,
  duration_min integer not null,
  deep_min     integer not null default 0,
  light_min    integer not null default 0,
  rem_min      integer not null default 0,
  awake_min    integer not null default 0,
  bedtime      timestamptz,
  wake_time    timestamptz,
  hrv_ms       integer,
  avg_hr       integer,
  lowest_hr    integer,
  source       text not null default 'coros',
  raw          jsonb,
  synced_at    timestamptz not null default now()
);

create table if not exists health_daily_vitals (
  date            date primary key,
  resting_hr      integer,
  avg_hr          integer,
  stress_avg      integer,
  stress_max      integer,
  recovery_pct    integer,
  recovery_status text check (recovery_status in ('full', 'good', 'partial', 'low')),
  steps           integer,
  active_calories integer,
  source          text not null default 'coros',
  raw             jsonb,
  synced_at       timestamptz not null default now()
);

create table if not exists health_training_load (
  date       date primary key,
  daily_load integer not null default 0,
  short_term integer not null default 0,
  long_term  integer not null default 0,
  ratio      numeric(5,2) not null default 1,
  status     text check (status in ('detraining', 'maintaining', 'optimal', 'high', 'overreaching')),
  source     text not null default 'coros',
  synced_at  timestamptz not null default now()
);

create table if not exists health_fitness_assessments (
  date                      date primary key,
  vo2max                    numeric(4,1),
  lactate_threshold_hr      integer,
  threshold_pace_sec_per_km integer,
  fitness_index             integer,
  race_predictions          jsonb not null default '[]'::jsonb,  -- [{label, distanceKm, seconds}]
  source                    text not null default 'coros',
  synced_at                 timestamptz not null default now()
);

create table if not exists health_workouts (
  id                  text primary key,
  external_id         text unique,
  date                date not null,
  start_time          timestamptz not null,
  sport               text not null,
  title               text not null,
  duration_sec        integer not null,
  distance_m          integer,
  avg_hr              integer,
  max_hr              integer,
  training_load       integer,
  calories            integer,
  elevation_gain_m    integer,
  avg_pace_sec_per_km integer,
  notes               text,
  laps                jsonb,                                       -- [{index, durationSec, distanceM, avgHr}]
  source              text not null default 'coros',
  raw                 jsonb,
  synced_at           timestamptz not null default now()
);
create index if not exists health_workouts_date_idx on health_workouts (date);

create table if not exists health_body_profile (
  date      date primary key,
  height_cm numeric(5,1),
  weight_kg numeric(5,2) not null,
  source    text not null default 'coros',
  synced_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- dexa
create table if not exists health_body_composition (
  id             text primary key,
  date           date not null,
  label          text,
  source         text not null check (source in ('dexa', 'inbody', 'scale')),
  weight_kg      numeric(5,2) not null,
  lean_mass_kg   numeric(5,2) not null,
  fat_mass_kg    numeric(5,2) not null,
  bone_mass_kg   numeric(4,2),
  body_fat_pct   numeric(4,1) not null,
  visceral_fat_g integer,
  regional       jsonb,                                            -- {trunk|arms|legs: {leanKg, fatKg}}
  notes          text,
  report_url     text,
  synced_at      timestamptz not null default now()
);
create index if not exists health_body_composition_date_idx on health_body_composition (date);

-- ---------------------------------------------------------------- food
create table if not exists health_food_entries (
  id          text primary key,
  date        date not null,
  time        text,
  description text not null,
  raw_text    text,
  calories    integer not null default 0,
  protein_g   integer not null default 0,
  carbs_g     integer not null default 0,
  fat_g       integer not null default 0,
  fiber_g     integer,
  source      text not null default 'chat' check (source in ('chat', 'manual')),
  synced_at   timestamptz not null default now()
);
create index if not exists health_food_entries_date_idx on health_food_entries (date);

create table if not exists health_nutrition_targets (
  effective_from date primary key,
  calories       integer not null,
  protein_g      integer not null,
  carbs_g        integer not null,
  fat_g          integer not null
);

-- ---------------------------------------------------------------- photos
create table if not exists health_progress_photos (
  id        text primary key,
  date      date not null,
  pose      text not null check (pose in ('front', 'side', 'back')),
  url       text,
  weight_kg numeric(5,2),
  note      text,
  synced_at timestamptz not null default now()
);
create index if not exists health_progress_photos_date_idx on health_progress_photos (date);

-- ---------------------------------------------------------------- check-ins
create table if not exists health_checkins (
  date            date primary key,
  sleep_quality   smallint check (sleep_quality between 1 and 5),
  energy          smallint check (energy between 1 and 5),
  mood            smallint check (mood between 1 and 5),
  hunger          smallint check (hunger between 1 and 5),
  cravings        smallint check (cravings between 1 and 5),
  digestion       smallint check (digestion between 1 and 5),
  soreness        smallint check (soreness between 1 and 5),
  gym_performance smallint check (gym_performance between 1 and 5),
  sex_drive       smallint check (sex_drive between 1 and 5),
  note            text,
  synced_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------- sync log
create table if not exists health_sync_runs (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,
  started_at    timestamptz not null,
  finished_at   timestamptz,
  status        text not null check (status in ('ok', 'error')),
  rows_upserted jsonb,
  error         text
);

-- ---------------------------------------------------------------- RLS
-- Public read, no anon writes. Writes go through the service role in
-- /api/health/ingest, which bypasses RLS.
do $$
declare t text;
begin
  foreach t in array array[
    'health_phases', 'health_focus_notes', 'health_sleep', 'health_daily_vitals',
    'health_training_load', 'health_fitness_assessments', 'health_workouts',
    'health_body_profile', 'health_body_composition', 'health_food_entries',
    'health_nutrition_targets', 'health_progress_photos', 'health_checkins'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;

alter table health_sync_runs enable row level security;

-- ---------------------------------------------------------------- backfill (optional)
-- Legacy subjective scores live in daily_aggregations.metrics (jsonb, 1–5).
-- Run once to seed health_checkins:
--
-- insert into health_checkins (date, sleep_quality, energy, mood, hunger, cravings,
--   digestion, soreness, gym_performance, sex_drive, note)
-- select date::date,
--   (metrics->'sleep_quality'->>'score')::smallint,
--   (metrics->'energy'->>'score')::smallint,
--   (metrics->'mood'->>'score')::smallint,
--   (metrics->'hunger_levels'->>'score')::smallint,
--   (metrics->'cravings'->>'score')::smallint,
--   (metrics->'digestion'->>'score')::smallint,
--   (metrics->'soreness'->>'score')::smallint,
--   (metrics->'gym_performance'->>'score')::smallint,
--   (metrics->'sex_drive'->>'score')::smallint,
--   summary
-- from daily_aggregations
-- on conflict (date) do nothing;
