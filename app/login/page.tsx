import Login from '@/app/components/Login';

// Renders on demand: the login form needs the Supabase browser client, which
// must not run during static prerender (preview builds may lack the env).
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return <Login />;
}