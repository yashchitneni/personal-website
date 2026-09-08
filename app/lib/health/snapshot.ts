import { createClient } from '@supabase/supabase-js'
import type { HealthSnapshot } from '@/app/types/health'
import { buildFixtureSnapshot } from './fixtures'
import { fetchSupabaseSnapshot } from './supabase'

/**
 * Single entry point for the /health page and /api/health.
 *
 * Resolution order:
 *  1. HEALTH_DATA_SOURCE=fixtures forces fixtures (useful for previews).
 *  2. If Supabase is configured and the health_* tables have data, use them.
 *  3. Otherwise fall back to deterministic fixtures so the page always renders.
 */
export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const forceFixtures = process.env.HEALTH_DATA_SOURCE === 'fixtures'

  if (!forceFixtures && url && anonKey) {
    try {
      const live = await fetchSupabaseSnapshot(createClient(url, anonKey))
      if (live) return live
    } catch (error) {
      console.warn('[health] falling back to fixtures:', error instanceof Error ? error.message : error)
    }
  }

  return buildFixtureSnapshot()
}
