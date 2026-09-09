import { UploadMemory } from './UploadMemory'

// Auth-gated Supabase page. Rendered on demand rather than prerendered, so the
// build does not need Supabase env (preview deployments may not have it).
export const dynamic = 'force-dynamic'

export default function UploadPage() {
  return <UploadMemory />
}
