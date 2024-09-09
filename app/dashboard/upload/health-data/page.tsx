import { auth } from '@clerk/nextjs/server'
import HealthDataUpload from '@/app/components/HealthDataUpload'

export default function HealthDataUploadPage() {
  const { userId } = auth()

  if (!userId) {
    return <div>Please sign in to access this page.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Health Data</h1>
      <HealthDataUpload userId={userId} />
    </div>
  )
}