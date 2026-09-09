import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireIngestAuth } from '@/app/lib/health/ingest-auth'
import { buildStaticIngestPayload } from '@/app/lib/health/seed'
import { upsertHealthPayload } from '@/app/lib/health/supabase'

export const dynamic = 'force-dynamic'

/**
 * One-shot backfill of authored series (phases, DEXA, goals, supplements, focus).
 * Same Bearer as /api/health/ingest. Does not touch Coros tables.
 *
 *   POST /api/health/seed
 *   Authorization: Bearer $HEALTH_INGEST_SECRET
 */
export async function POST(request: Request) {
  const auth = requireIngestAuth(request)
  if (!auth.ok) return auth.response

  const payload = buildStaticIngestPayload()
  const result = await upsertHealthPayload(auth.client, payload)
  if (result.ok) {
    revalidatePath('/health')
    revalidatePath('/api/health')
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 207 })
}
