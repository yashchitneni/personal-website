import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import type { HealthIngestPayload } from '@/app/types/health'
import { requireIngestAuth } from '@/app/lib/health/ingest-auth'
import { HEALTH_TABLES, upsertHealthPayload } from '@/app/lib/health/supabase'

export const dynamic = 'force-dynamic'

/**
 * Private write endpoint for the health warehouse.
 *
 * Callers: the Coros sync job (Coros MCP → this route), the food-logging chat
 * hook, and manual DEXA / photo entry. Never called from the browser.
 *
 *   POST /api/health/ingest
 *   Authorization: Bearer $HEALTH_INGEST_SECRET
 *   { "source": "coros", "sleep": [...], "vitals": [...], ... }
 *
 * Contract: scripts/health/coros-to-ingest.md
 */
export async function POST(request: Request) {
  const auth = requireIngestAuth(request)
  if (!auth.ok) return auth.response

  let payload: HealthIngestPayload
  try {
    payload = (await request.json()) as HealthIngestPayload
  } catch {
    return NextResponse.json({ ok: false, errors: ['invalid json'] }, { status: 400 })
  }
  if (!payload || typeof payload.source !== 'string') {
    return NextResponse.json({ ok: false, errors: ['missing source'] }, { status: 400 })
  }
  const unknown = Object.keys(payload).filter((k) => k !== 'source' && !(k in HEALTH_TABLES))
  if (unknown.length) {
    return NextResponse.json({ ok: false, errors: [`unknown series: ${unknown.join(', ')}`] }, { status: 400 })
  }

  const result = await upsertHealthPayload(auth.client, payload)
  if (result.ok) {
    revalidatePath('/health')
    revalidatePath('/api/health')
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 207 })
}
