'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { uploadBiofeedback } from '@/app/actions/upload-biofeedback'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { redirect } from 'next/navigation'

export default function UploadPage() {
  const { isLoaded, userId, sessionId } = useAuth()
  const [jsonData, setJsonData] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  if (isLoaded && !userId) {
    redirect('/sign-in')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      const data = JSON.parse(jsonData)
      await uploadBiofeedback(data)
      toast({
        title: 'Success',
        description: 'Biofeedback data uploaded successfully',
      })
      setJsonData('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload biofeedback data',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Biofeedback Data</h1>
      <form onSubmit={handleSubmit}>
        <Textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          placeholder="Paste your JSON data here"
          className="mb-4"
          rows={10}
        />
        <Button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  )
}