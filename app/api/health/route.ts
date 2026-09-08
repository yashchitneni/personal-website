import { NextResponse } from 'next/server'
import { getHealthSnapshot } from '@/app/lib/health/snapshot'

export const revalidate = 3600

/** Public read of the assembled health snapshot (same data the /health page renders). */
export async function GET() {
  const snapshot = await getHealthSnapshot()
  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
