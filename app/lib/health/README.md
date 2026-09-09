# Health warehouse

Public page: `/health`. JSON: `GET /api/health`. Writes: `POST /api/health/ingest` (and `POST /api/health/seed`).

Resolution (`getHealthSnapshot`):

1. `HEALTH_DATA_SOURCE=fixtures` forces fixtures (previews).
2. If Supabase is configured and `health_phases`, `health_sleep`, `health_body_profile`, or `health_body_composition` has rows, the page reads the warehouse (`source: "supabase"`).
3. Otherwise fixtures (`source: "fixtures"`) so the page always renders.

The Next app never calls Coros. Work Ops maps Coros MCP → ingest. See [`scripts/health/coros-to-ingest.md`](../../../scripts/health/coros-to-ingest.md).

## Production wiring

Do this **in order**. Seeding only Coros sleep flips the page to live Supabase and **hides** Day 0 DEXA / phases unless those rows exist too.

### 1. Apply the migration

In the Supabase SQL editor (or CLI), run:

`supabase/migrations/20260908_health_metrics.sql`

Confirm `health_*` tables exist, including `health_sync_runs`.

### 2. Set env vars (Production **and** Preview)

| Variable | Where | Why |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Anon read for `/health` and `GET /api/health` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (sensitive) | Ingest / seed writes; never expose to the browser |
| `HEALTH_INGEST_SECRET` | Vercel (sensitive) + Work Ops | Bearer for `POST /api/health/ingest` and `/seed` |
| `HEALTH_DATA_SOURCE` | optional | Set to `fixtures` only to force preview data |

Redeploy after saving so the server picks them up.

Do **not** put Coros credentials in Vercel. Sync is external.

### 3. Backfill authored series

```bash
curl -sS -X POST "$HEALTH_SITE_URL/api/health/seed" \
  -H "Authorization: Bearer $HEALTH_INGEST_SECRET"
```

Upserts phases, DEXA compositions, goals, supplements, and the Day 0 focus note from `app/lib/health/data/*`. Safe to re-run (natural-key upsert).

### 4. Backfill Coros, then daily sync

From Work Ops (Coros MCP, no keys in this repo):

1. Pull sleep, daily vitals, training load, workouts, fitness, optional body profile.
2. Map with `app/lib/health/coros-map.ts` (typed builders + alias helpers).
3. `POST /api/health/ingest` with `{ "source": "coros", ... }`.

Payload shape and curl: [`scripts/health/coros-to-ingest.md`](../../../scripts/health/coros-to-ingest.md).

### 5. Confirm live, not fixtures

```bash
curl -sS -D - "$HEALTH_SITE_URL/api/health" -o /tmp/health.json | grep -i x-health-source
# X-Health-Source: supabase

python3 -c "import json; print(json.load(open('/tmp/health.json'))['source'])"
# supabase
```

`/health` should no longer show the “preview data” badge. `health_sync_runs` should have a `manual` seed row and `coros` ingest rows.

### 6. Optional verify stub

`.github/workflows/health-source.yml` is `workflow_dispatch` only. It GETs `/api/health` (an endpoint we control) and fails if `source` is still `fixtures`. Set repo variable `HEALTH_SITE_URL`. No Coros secrets.

## Local / preview

Without Supabase env, or with empty `health_*` tables, `/health` keeps fixtures. That is intentional.
