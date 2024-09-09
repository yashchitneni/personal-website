import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Process and insert data into Supabase
    const { error } = await supabase
      .from('health_data')
      .insert({
        user_id: userId,
        date: data.date,
        time: data.time,
        metrics: data.metrics,
        additional_notes: data.additional_notes,
        summary: data.summary,
      })

    if (error) throw error

    // Update average scores for the day
    await updateAverageScores(userId, data.date)

    return NextResponse.json({ message: 'Data uploaded successfully' })
  } catch (error) {
    console.error('Error uploading data:', error)
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 })
  }
}

async function updateAverageScores(userId: string, date: string) {
  const { data: entries, error } = await supabase
    .from('health_data')
    .select('metrics')
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw error

  const averagedMetrics: { [key: string]: { score: number; notes: string } } = {}

  entries.forEach((entry) => {
    Object.entries(entry.metrics).forEach(([metricName, metricData]) => {
      if (!averagedMetrics[metricName]) {
        averagedMetrics[metricName] = { score: 0, notes: '' }
      }
      // Type assertion to specify the structure of metricData
      averagedMetrics[metricName].score += (metricData as { score: number }).score
      averagedMetrics[metricName].notes += (metricData as { notes: string }).notes + ' '
    })
  })

  Object.keys(averagedMetrics).forEach((metricName) => {
    averagedMetrics[metricName].score /= entries.length
    averagedMetrics[metricName].notes = averagedMetrics[metricName].notes.trim()
  })

  const { error: updateError } = await supabase
    .from('health_data_daily')
    .upsert({
      user_id: userId,
      date,
      metrics: averagedMetrics,
    })

  if (updateError) throw updateError
}