# Coros → `POST /api/health/ingest`

Work Ops playbook. Coros stays outside the Next app (Coros MCP). This repo only accepts camelCase JSON.

**Do not put Coros credentials in Vercel.** Post to an endpoint we control.

## Auth

```
POST {HEALTH_SITE_URL}/api/health/ingest
Authorization: Bearer {HEALTH_INGEST_SECRET}
Content-Type: application/json
```

`HEALTH_SITE_URL` is the deployed origin (Production or Preview). `HEALTH_INGEST_SECRET` is the same value as the Vercel env var.

Any subset of series may be sent. Unknown top-level keys → `400`. Upsert is idempotent on the conflict column below. Nested objects (`racePredictions`, `laps`) are stored as jsonb as-is.

Dates are `YYYY-MM-DD` in the **owner's local timezone**.

## Series ↔ `HEALTH_TABLES`

| Payload key | Table | Conflict | Required fields |
|---|---|---|---|
| `sleep` | `health_sleep` | `date` | `date`, `durationMin` |
| `vitals` | `health_daily_vitals` | `date` | `date` |
| `load` | `health_training_load` | `date` | `date`, `dailyLoad` |
| `fitness` | `health_fitness_assessments` | `date` | `date` |
| `workouts` | `health_workouts` | `id` | `id`, `date`, `startTime`, `sport`, `title`, `durationSec` |
| `bodyProfile` | `health_body_profile` | `date` | `date`, `weightKg` |

Coros sync should set `"source": "coros"` at the top level **and** on each row. Other series (`phases`, `compositions`, `goals`, …) are seeded with `POST /api/health/seed`, not from Coros.

## Exact JSON shapes

Types live in `app/types/health.ts`. Builders live in `app/lib/health/coros-map.ts`.

### Envelope

```json
{
  "source": "coros",
  "sleep": [],
  "vitals": [],
  "load": [],
  "fitness": [],
  "workouts": [],
  "bodyProfile": []
}
```

Omit empty arrays. Do not send keys that are not in `HEALTH_TABLES`.

### `sleep` → `health_sleep`

```json
{
  "date": "2026-09-08",
  "score": 84,
  "durationMin": 452,
  "deepMin": 86,
  "lightMin": 248,
  "remMin": 98,
  "awakeMin": 20,
  "bedtime": "2026-09-07T22:41:00",
  "wakeTime": "2026-09-08T06:13:00",
  "hrvMs": 62,
  "avgHr": 51,
  "lowestHr": 46,
  "source": "coros"
}
```

`score`, `hrvMs`, `avgHr`, `lowestHr`, `bedtime`, `wakeTime` may be `null`. Stage minutes default to `0` if omitted. `date` is the **morning the sleep ended**.

### `vitals` → `health_daily_vitals`

```json
{
  "date": "2026-09-08",
  "restingHr": 48,
  "avgHr": 71,
  "stressAvg": 28,
  "stressMax": 64,
  "recoveryPct": 78,
  "recoveryStatus": "good",
  "steps": 10420,
  "activeCalories": 640,
  "source": "coros"
}
```

`recoveryStatus` is `"full" | "good" | "partial" | "low"`. If omitted, `dailyVitals()` / `fromCorosVitals()` derive it from `recoveryPct` (≥90 full, ≥70 good, ≥45 partial, else low). All metric fields may be `null`.

### `load` → `health_training_load`

```json
{
  "date": "2026-09-08",
  "dailyLoad": 82,
  "shortTerm": 510,
  "longTerm": 470,
  "ratio": 1.09,
  "status": "optimal",
  "source": "coros"
}
```

`shortTerm` = 7-day acute. `longTerm` = 42-day chronic. `ratio` = short / long (2 d.p.). `status` is `"detraining" | "maintaining" | "optimal" | "high" | "overreaching"` (`<0.8`, `<1.0`, `≤1.3`, `≤1.5`, else overreaching). Builders fill `ratio` and `status` when omitted.

### `fitness` → `health_fitness_assessments`

```json
{
  "date": "2026-09-08",
  "vo2max": 52.9,
  "lactateThresholdHr": 172,
  "thresholdPaceSecPerKm": 255,
  "fitnessIndex": 62,
  "racePredictions": [
    { "label": "5K", "distanceKm": 5, "seconds": 1190 },
    { "label": "10K", "distanceKm": 10, "seconds": 2481 },
    { "label": "Half", "distanceKm": 21.0975, "seconds": 5580 },
    { "label": "Marathon", "distanceKm": 42.195, "seconds": 12020 }
  ],
  "source": "coros"
}
```

`racePredictions` is jsonb. Use an empty array when Coros has none.

### `workouts` → `health_workouts`

```json
{
  "id": "coros-example-2026-09-08-run",
  "externalId": "example-label-1",
  "date": "2026-09-08",
  "startTime": "2026-09-08T06:40:00",
  "sport": "run",
  "title": "Easy run",
  "durationSec": 2700,
  "distanceM": 8500,
  "avgHr": 142,
  "maxHr": 161,
  "trainingLoad": 82,
  "calories": 540,
  "elevationGainM": 48,
  "avgPaceSecPerKm": 318,
  "notes": null,
  "laps": [{ "index": 0, "durationSec": 2700, "distanceM": 8500, "avgHr": 142 }],
  "source": "coros"
}
```

`sport`: `"run" | "strength" | "bike" | "swim" | "hike" | "walk" | "row" | "mobility" | "other"`. Prefer Coros `labelId` as `externalId` and `coros-{labelId}` as `id`. `laps` may be `null`.

### `bodyProfile` → `health_body_profile`

```json
{
  "date": "2026-09-08",
  "heightCm": 177.8,
  "weightKg": 80.0,
  "source": "coros"
}
```

Optional. Only post days Coros actually has a weight.

## Mapping from Coros MCP

Inspect the live tool schema in Work Ops. Do not assume field names from memory.

Preferred path:

1. Read MCP rows.
2. Call the typed builders (`sleepNight`, `dailyVitals`, `trainingLoadDay`, `fitnessAssessment`, `workout`, `bodyProfile`) with explicit fields.
3. Or pass raw objects through `fromCorosSleep` / `fromCorosVitals` / `fromCorosLoad` / `fromCorosFitness` / `fromCorosWorkout` / `fromCorosBodyProfile` / `buildCorosIngestPayload`.

Alias helpers (best-effort; confirm against the tool result):

| Our field | Typical aliases |
|---|---|
| `date` | `happenDay`, `happen_day` (`YYYYMMDD` ok) |
| sleep `durationMin` | `durationMin`, or `duration` / `totalSleepTime` as **seconds** |
| sleep stages | `deepSleep`, `remSleep`, `lightSleep`, `awakeTime` (seconds unless `*Min`) |
| `hrvMs` | `avgSleepHrv`, `sleepHrv`, `hrv`, `rmssd` |
| `restingHr` | `rhr`, `restHr` |
| `recoveryPct` | `recovery`, `recoveryScore` |
| `dailyLoad` | `trainingLoad`, `tl` |
| `shortTerm` | `t7d`, `acute`, `atl` |
| `longTerm` | `t42d`, `chronic`, `ctl` |
| workout `externalId` | `labelId`, `sportLabelId`, `activityId` |
| `sport` | `sportType` number (`100` run, `200` bike, `300` swim, `600` strength) or a name |
| `durationSec` | `duration`, `workoutTime` |
| `vo2max` | `vo2Max` |
| `fitnessIndex` | `t28d`, `baseFitness` |

`validateCorosPayload(payload)` returns field errors before POST.

Unit traps: Coros durations are usually **seconds**; ingest sleep is **minutes** and workouts are **seconds**. `avgSpeed` on some Training Hub payloads is already pace-sec/km — the workout helper only treats `avgSpeed` as pace when that key is present.

## POST from Work Ops

Smoke-test with the checked-in example (does not need Coros):

```bash
export HEALTH_SITE_URL='https://YOUR_PRODUCTION_ORIGIN'
export HEALTH_INGEST_SECRET='…'   # same as Vercel

./scripts/health/post-ingest.sh scripts/health/example-coros-ingest.json
```

Daily / backfill (after mapping):

```bash
curl -sS -X POST "$HEALTH_SITE_URL/api/health/ingest" \
  -H "Authorization: Bearer $HEALTH_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/coros-payload.json
```

Expected `200`:

```json
{ "ok": true, "source": "coros", "upserted": { "sleep": 1, "vitals": 1 }, "errors": [] }
```

`207` = partial failure; read `errors`. `401` = bad Bearer. `503` = missing Supabase service role.

Then verify:

```bash
./scripts/health/verify-source.sh
# X-Health-Source: supabase
```

`GET /api/health` JSON also has `"source": "supabase" | "fixtures"`. `/health` hides the “preview data” badge when live.

## Suggested Work Ops routine

1. Production wiring in `app/lib/health/README.md` (migration, env, seed) — **seed first**.
2. One-time Coros history backfill (sleep / vitals / load / workouts / fitness / body profile).
3. Daily: pull yesterday (and any gaps) from Coros MCP → map → ingest.
4. Confirm `health_sync_runs` and `X-Health-Source: supabase`.

No Vercel Cron talks to Coros. Optional GitHub Action `.github/workflows/health-source.yml` only GETs `/api/health`.
