'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedTitle } from '../../../components/AnimatedTitle'
import { useAuth, SignInButton } from '@clerk/nextjs'
import { useToast } from "@/components/ui/use-toast"

export default function UploadHealthData() {
  const [jsonData, setJsonData] = useState('')
  const { isLoaded, isSignedIn, userId, getToken } = useAuth()
  const { toast } = useToast()

  const handleUpload = async () => {
    if (!jsonData) {
      toast({
        title: 'No data entered',
        description: 'Please enter JSON data to upload.',
        variant: 'destructive',
      })
      return
    }

    try {
      const token = await getToken()
      const response = await fetch('/api/upload-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: jsonData,
      })

      if (response.ok) {
        toast({
          title: 'Upload successful',
          description: 'Your health data has been uploaded.',
        })
        setJsonData('')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your health data.',
        variant: 'destructive',
      })
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedTitle>Upload Health Data</AnimatedTitle>
      {isSignedIn ? (
        <>
          <div className="mb-6">
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your JSON data here"
              rows={10}
            />
          </div>
          <Button onClick={handleUpload}>Upload Data</Button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Please sign in to upload health data.</p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      )}
    </div>
  )
}