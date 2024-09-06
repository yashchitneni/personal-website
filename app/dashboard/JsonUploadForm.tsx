'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

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

/**
 * Represents the structure of biofeedback data.
 * @typedef {Object} BiofeedbackData
 * @property {string} date - The date of the biofeedback entry.
 * @property {string} time - The time of the biofeedback entry.
 * @property {Object} metrics - The biofeedback metrics.
 * @property {Object} metrics.hunger_levels - Hunger level metrics.
 * @property {number} metrics.hunger_levels.score - Hunger level score.
 * @property {string} metrics.hunger_levels.notes - Hunger level notes.
 * @property {Object} metrics.digestion - Digestion metrics.
 * @property {number} metrics.digestion.score - Digestion score.
 * @property {string} metrics.digestion.notes - Digestion notes.
 * @property {Object} metrics.sleep_quality - Sleep quality metrics.
 * @property {number} metrics.sleep_quality.score - Sleep quality score.
 * @property {string} metrics.sleep_quality.notes - Sleep quality notes.
 * @property {Object} metrics.energy_levels - Energy level metrics.
 * @property {number} metrics.energy_levels.score - Energy level score.
 * @property {string} metrics.energy_levels.notes - Energy level notes.
 * @property {Object} metrics.gym_performance - Gym performance metrics.
 * @property {number} metrics.gym_performance.score - Gym performance score.
 * @property {string} metrics.gym_performance.notes - Gym performance notes.
 * @property {string} additional_notes - Additional notes for the entry.
 * @property {string} summary - Summary of the biofeedback entry.
 */

/**
 * Form component for uploading JSON biofeedback data.
 * @function JsonUploadForm
 * @returns {JSX.Element} The rendered JSON upload form.
 */
export default function JsonUploadForm() {
  const { getToken } = useAuth()
  const [jsonData, setJsonData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles form submission and data upload.
   * @async
   * @function handleSubmit
   * @param {React.FormEvent} e - The form submission event.
   */
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