'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { format, parseISO } from 'date-fns';
import { DateRangePicker } from '../components/date-range-picker'
import { BiofeedbackChart } from "../components/BiofeedbackChart";
import { TimelineNavigation } from "../components/TimelineNavigation";
import { DailyInsights } from "../components/DailyInsights";
import { createClient } from '@supabase/supabase-js'
import { DateRange } from '../../types/date-range'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Metric = {
  score: number
  notes: string
}

type BiofeedbackEntry = {
  date: string
  time: string
  metrics: {
    [key: string]: Metric
  }
  additional_notes: string[]
  summary: string
}

const metrics = [
  { name: "Sleep Quality", color: "#ff6b6b" },
  { name: "Hunger Levels", color: "#f7b731" },
  { name: "Digestion", color: "#a55eea" },
  { name: "Energy", color: "#4ecdc4" },
  { name: "Gym Performance", color: "#5d62b5" },
  { name: "Mood", color: "#45b7d1" },
  { name: "Cravings", color: "#fd9644" },
  { name: "Sex Drive", color: "#fc5c65" },
  { name: "Soreness", color: "#26de81" },
]


export default function EnhancedBiofeedbackTracker() {
  const [selectedMetrics, setSelectedMetrics] = useState(metrics.slice(0, 2).map(m => m.name))
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [chartData, setChartData] = useState<BiofeedbackEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('biofeedback')
          .select('*')
          .gte('date', format(dateRange.startDate, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.endDate, 'yyyy-MM-dd'))
          .order('date', { ascending: true })

        if (error) {
          console.error('Error fetching data:', error)
        } else {
          setChartData(data)
        }
      }

      fetchData()
    }
  }, [dateRange])

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    )
  }

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    setSelectedDate(range?.startDate || null)
  }

  const handleDataPointClick = (data: BiofeedbackEntry) => {
    setSelectedDate(parseISO(data.date))
  }

  const handleTimelineDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const getDailyInsights = (date: Date) => {
    const dayData = chartData.find(d => d.date === format(date, 'yyyy-MM-dd'))
    if (!dayData) return []

    return selectedMetrics.map(metric => {
      const metricValues = chartData.map(d => d.metrics[metric]?.score || 0)
      const average = metricValues.reduce((a, b) => a + b, 0) / metricValues.length
      const currentValue = dayData.metrics[metric]?.score || 0
      const difference = currentValue - average
      let change: 'positive' | 'negative' | 'neutral' = 'neutral'
      
      if (difference > 0.1) {
        change = 'positive'
      } else if (difference < -0.1) {
        change = 'negative'
      }

      return {
        title: metric,
        value: currentValue.toFixed(2), // Changed from endDateFixed to toFixed
        change: change,
      }
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biofeedback Tracker</CardTitle>
          <DateRangePicker 
          value={dateRange}
          onChange={(range: DateRange) => handleDateRangeChange(range)} />
        </CardHeader>
        <CardContent>
          <BiofeedbackChart 
            data={chartData}
            selectedMetrics={selectedMetrics}
            metrics={metrics}
            onDataPointClick={handleDataPointClick}
          />
          <div className="flex flex-wrap gap-2 my-4">
            {metrics.map((metric) => (
              <Button
                key={metric.name}
                variant={selectedMetrics.includes(metric.name) ? "default" : "outline"}
                onClick={() => handleMetricToggle(metric.name)}
                className="rounded-full"
                style={{ backgroundColor: selectedMetrics.includes(metric.name) ? metric.color : undefined }}
              >
                {metric.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {dateRange && (
        <TimelineNavigation 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate} 
          onDateSelect={handleTimelineDateSelect}
        />
      )}

      {selectedDate && (
        <DailyInsights 
          date={selectedDate}
          insights={getDailyInsights(selectedDate)}
        />
      )}
    </div>
  )
}