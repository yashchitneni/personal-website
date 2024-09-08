import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="dashboard-layout">
      <main>{children}</main>
    </div>
  )
}