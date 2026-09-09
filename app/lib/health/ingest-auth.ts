import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type IngestAuth =
  | { ok: true; client: SupabaseClient }
  | { ok: false; response: NextResponse }

/**
 * Shared gate for POST /api/health/ingest and POST /api/health/seed.
 * Bearer HEALTH_INGEST_SECRET + a service-role Supabase client.
 */
export function requireIngestAuth(request: Request): IngestAuth {
  const secret = process.env.HEALTH_INGEST_SECRET
  const auth = request.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return { ok: false, response: NextResponse.json({ ok: false, errors: ['unauthorized'] }, { status: 401 }) }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return { ok: false, response: NextResponse.json({ ok: false, errors: ['supabase is not configured'] }, { status: 503 }) }
  }

  return { ok: true, client: createClient(url, serviceKey, { auth: { persistSession: false } }) }
}
