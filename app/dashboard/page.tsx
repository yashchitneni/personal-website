'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Database } from '@/types/supabase'

// Define the type for a single biofeedback item
type BiofeedbackItem = Database['public']['Tables']['biofeedback']['Row']

export default function DashboardPage() {
  const [biofeedbackData, setBiofeedbackData] = useState<BiofeedbackItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial data
    fetchBiofeedbackData()

    // Set up real-time subscription
    const channel = supabase
      .channel('biofeedback_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'biofeedback' },
        (payload: { new: BiofeedbackItem }) => {
          setBiofeedbackData((prevData) => [payload.new, ...prevData].slice(0, 100))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchBiofeedbackData() {
    const { data, error } = await supabase
      .from('biofeedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching biofeedback data:', error)
    } else {
      setBiofeedbackData(data)
    }
  }

  const chartData = biofeedbackData.map(item => ({
    time: new Date(item.created_at).toLocaleTimeString(),
    hungerScore: item.hunger_score,
    digestionScore: item.digestion_score,
    sleepQualityScore: item.sleep_quality_score,
    energyLevelsScore: item.energy_levels_score,
    gymPerformanceScore: item.gym_performance_score,
  }))

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Biofeedback Dashboard</h1>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hungerScore" stroke="#8884d8" />
            <Line type="monotone" dataKey="digestionScore" stroke="#82ca9d" />
            <Line type="monotone" dataKey="sleepQualityScore" stroke="#ffc658" />
            <Line type="monotone" dataKey="energyLevelsScore" stroke="#ff7300" />
            <Line type="monotone" dataKey="gymPerformanceScore" stroke="#00C49F" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}