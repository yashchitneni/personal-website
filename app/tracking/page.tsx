'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface BiofeedbackData {
  id: number;
  date: string;
  time: string;
  hunger_score: number;
  hunger_notes: string;
  digestion_score: number;
  digestion_notes: string;
  sleep_quality_score: number;
  sleep_quality_notes: string;
  energy_levels_score: number;
  energy_levels_notes: string;
  gym_performance_score: number | null;
  gym_performance_notes: string;
  additional_notes: string[];
  summary: string;
  created_at: string;
}

export default function TrackingPage() {
  const [biofeedbackData, setBiofeedbackData] = useState<BiofeedbackData[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchBiofeedbackData()

    const channel = supabase
      .channel('biofeedback_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'biofeedback' }, (payload: { new: BiofeedbackData }) => {
        setBiofeedbackData((prevData) => [payload.new, ...prevData].slice(0, 100))
      })
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
      setBiofeedbackData(data || [])
    }
  }

  const chartData = biofeedbackData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    hunger: item.hunger_score,
    digestion: item.digestion_score,
    sleep: item.sleep_quality_score,
    energy: item.energy_levels_score,
    gym: item.gym_performance_score
  }))

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Biofeedback Tracking</h1>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hunger" stroke="#8884d8" name="Hunger" />
            <Line type="monotone" dataKey="digestion" stroke="#82ca9d" name="Digestion" />
            <Line type="monotone" dataKey="sleep" stroke="#ffc658" name="Sleep Quality" />
            <Line type="monotone" dataKey="energy" stroke="#ff7300" name="Energy Levels" />
            <Line type="monotone" dataKey="gym" stroke="#00C49F" name="Gym Performance" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}