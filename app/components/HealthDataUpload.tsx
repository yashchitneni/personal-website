'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HealthDataUploadProps {
  userId: string
}

export default function HealthDataUpload({ userId }: HealthDataUploadProps) {
  const [data, setData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload data')
      }

      setData('')
      router.refresh()
      // Optionally, redirect to the health tracker page
      // router.push('/quantifying/health')
    } catch (error) {
      console.error('Error uploading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="w-full h-40 p-2 border rounded"
        placeholder="Paste your health data here..."
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </button>
    </form>
  )
}