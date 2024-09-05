import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JsonUploadForm from './JsonUploadForm'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li>
            <Link href="/biofeedback" className="text-blue-600 hover:underline">
              Biofeedback
            </Link>
          </li>
          <li>
            <Link href="/upload-json" className="text-blue-600 hover:underline">
              Upload JSON
            </Link>
          </li>
        </ul>
      </nav>
      <JsonUploadForm />
    </div>
  )
}