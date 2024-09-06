'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

// Remove the Supabase client initialization from here

interface BiofeedbackData {
  date: string;
  time: string;
  metrics: {
    hunger_levels: { score: number; notes: string };
    digestion: { score: number; notes: string };
    sleep_quality: { score: number; notes: string };
    energy_levels: { score: number; notes: string };
    gym_performance: { score: number; notes: string };
  };
  additional_notes: string;
  summary: string;
}

export default function JsonUploadForm() {
  const { getToken } = useAuth()
  const [jsonData, setJsonData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken({ template: 'supabase' })
      if (!token) throw new Error('Not authenticated')

      // Initialize Supabase client here
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
        }
      )

      const data: BiofeedbackData = JSON.parse(jsonData)
      
      const { error } = await supabase.from('biofeedback').insert({
        date: new Date(`${data.date}T${data.time}`),
        time: new Date(`${data.date}T${data.time}`),
        hunger_score: data.metrics.hunger_levels.score,
        hunger_notes: data.metrics.hunger_levels.notes,
        digestion_score: data.metrics.digestion.score,
        digestion_notes: data.metrics.digestion.notes,
        sleep_quality_score: data.metrics.sleep_quality.score,
        sleep_quality_notes: data.metrics.sleep_quality.notes,
        energy_levels_score: data.metrics.energy_levels.score,
        energy_levels_notes: data.metrics.energy_levels.notes,
        gym_performance_score: data.metrics.gym_performance.score,
        gym_performance_notes: data.metrics.gym_performance.notes,
        additional_notes: data.additional_notes,
        summary: data.summary,
      })

      if (error) throw error

      setJsonData('')
      alert('Data uploaded successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={jsonData}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonData(e.target.value)}
        placeholder="Paste your JSON data here"
        rows={10}
        className="w-full p-2 border rounded"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}