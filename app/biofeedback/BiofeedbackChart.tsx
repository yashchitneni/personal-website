'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BiofeedbackEntry {
  date: string
  hunger_score: number
  digestion_score: number
  sleep_quality_score: number
  energy_levels_score: number
  gym_performance_score: number | null
}

export default function BiofeedbackChart() {
  const [data, setData] = useState<BiofeedbackEntry[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('biofeedback')
        .select('date, hunger_score, digestion_score, sleep_quality_score, energy_levels_score, gym_performance_score')
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setData(data)
      }
    }

    fetchData()

    // Set up real-time listener
    const subscription = supabase
      .channel('biofeedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'biofeedback' }, fetchData)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hunger_score" stroke="#8884d8" />
        <Line type="monotone" dataKey="digestion_score" stroke="#82ca9d" />
        <Line type="monotone" dataKey="sleep_quality_score" stroke="#ffc658" />
        <Line type="monotone" dataKey="energy_levels_score" stroke="#ff7300" />
        <Line type="monotone" dataKey="gym_performance_score" stroke="#00C49F" />
      </LineChart>
    </ResponsiveContainer>
  )
}