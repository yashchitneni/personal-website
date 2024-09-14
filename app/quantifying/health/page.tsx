'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../components/ui/button'
import { BiofeedbackChart } from '../../components/BiofeedbackChart'
import { DateRangePicker } from '../../components/date-range-picker'
import { AnimatedTitle } from '../../components/AnimatedTitle'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { TimelineNavigation } from "../../components/TimelineNavigation"
import { DailyInsights } from "../../components/DailyInsights"
import { createClient } from '@supabase/supabase-js'
import { format, parseISO, subDays } from 'date-fns'
import { DateRange } from '@/app/types/date-range'
import { DailyAggregation, Metric } from '../../types/metrics'
import { Insight } from '@/app/types/insights'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default function HealthPage() {
  const router = useRouter()
  const [selectedMetrics, setSelectedMetrics] = useState(metrics.slice(0, 2).map(m => m.name))
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(), // Set to a week ago
    endDate: new Date() // Set to today
  })
  const [chartData, setChartData] = useState<DailyAggregation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('daily_aggregations')
        .select('*')
        .gte('date', format(dateRange.startDate, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setChartData(data || [])
      }
    }

    fetchData()
  }, [dateRange])

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    )
  }

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    setSelectedDate(range.startDate)
  }

  const handleDataPointClick = (data: DailyAggregation) => {
    setSelectedDate(parseISO(data.date))
  }

  const handleTimelineDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const getDailyInsights = (date: Date): Insight[] => {
    // ... (implement logic to return an array of insights)
    return []; // Replace with actual insights logic
  }

  function isMetric(value: any): value is Metric {
    return value && typeof value === 'object' && 'score' in value;
  }

  const handleUploadClick = () => {
    router.push('/quantifying/health/upload')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedTitle>Quantifying Health</AnimatedTitle>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <Button onClick={handleUploadClick} variant="outline">Upload Health Data</Button>
          <DateRangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </CardHeader>
        <CardContent>
          <BiofeedbackChart 
            data={chartData}
            selectedMetrics={selectedMetrics}
            metrics={metrics}
            onDataPointClick={handleDataPointClick}
            dateRange={{ 
              startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
              endDate: format(dateRange.endDate, 'yyyy-MM-dd') 
            }}
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