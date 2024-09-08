'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

interface BiofeedbackData {
  date: string; // Keep as string for timestamp
  time: string; // Keep as string for timestamp
  hunger_score: number;
  hunger_notes: string;
  digestion_score: number;
  digestion_notes: string;
  sleep_quality_score: number;
  sleep_quality_notes: string;
  energy_levels_score: number;
  energy_levels_notes: string;
  gym_performance_score: number;
  gym_performance_notes: string;
  additional_notes: string[]; // Assuming ARRAY is represented as a string array
  summary: string;
}

export async function uploadBiofeedback(data: BiofeedbackData) {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { error } = await supabase
    .from('biofeedback')
    .insert({ user_id: userId, data })

  if (error) {
    console.error('Supabase error:', error)
    throw new Error('Failed to upload biofeedback data')
  }

  return { success: true }
}