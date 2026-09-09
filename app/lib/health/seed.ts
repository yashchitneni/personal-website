import type { HealthIngestPayload } from '@/app/types/health'
import { DEXA_HISTORY } from './data/dexa-history'
import { FOCUS, GOALS, PHASES, SUPPLEMENTS } from './data/plan'

/**
 * Authored series that must land before (or with) the first Coros ingest.
 * `fetchSupabaseSnapshot` treats any of phases / sleep / bodyProfile /
 * compositions as "the warehouse is live" and then returns empty arrays
 * for everything else — so seeding only Coros sleep would hide Day 0 DEXA.
 */
export function buildStaticIngestPayload(): HealthIngestPayload {
  return {
    source: 'manual',
    phases: PHASES,
    focus: FOCUS,
    goals: GOALS,
    supplements: SUPPLEMENTS,
    compositions: DEXA_HISTORY,
  }
}
