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
import { format, parseISO, startOfDay } from 'date-fns'
import { DateRange } from '@/app/types/date-range'
import { DailyAggregation, Metric } from '@/app/types/metrics'
import { Insight } from '@/app/types/insights'
import ProgressBar from '../../components/ui/progressBar' // New component for progress visualization
import MetricIcon from '../../components/ui/metricIcon' // New component for metric icons
// import { EnhancedChart } from '../../components/EnhancedChart';

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

/**
 * HealthPage Component
 * @component
 * @description Renders the main health dashboard page. It displays biofeedback charts,
 * allows metric selection, and provides daily insights.
 * @returns {JSX.Element} The rendered HealthPage component.
 */
export default function HealthPage() {
  const router = useRouter()
  const [selectedMetrics, setSelectedMetrics] = useState(metrics.slice(0, 2).map(m => m.name))
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(), // Set to a week ago
    endDate: new Date() // Set to today
  })
  const [chartData, setChartData] = useState<DailyAggregation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  /**
   * Updates the selected date when the date range changes.
   */
  useEffect(() => {
    if (dateRange.startDate) {
      setSelectedDate(startOfDay(dateRange.startDate))
    }
  }, [dateRange])

  /**
   * Fetches biofeedback data based on the selected date range.
   */
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
        console.log('Data fetched from database:', data) // Add this line
        setChartData(data || [])
      }
    }

    fetchData()
  }, [dateRange])

  /**
   * Toggles the selection of a metric for display.
   * @function
   * @param {string} metric - The name of the metric to toggle.
   */
  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    )
  }

  /**
   * Updates the date range for data display.
   * @function
   * @param {DateRange} range - The new date range to set.
   */
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    setSelectedDate(startOfDay(range.startDate))
  }

  /**
   * Handles the click event on a data point in the chart.
   * @function
   * @param {DailyAggregation} data - The data point that was clicked.
   */
  const handleDataPointClick = (data: DailyAggregation) => {
    // Check if data has a date property before parsing
    if (data && data.date) {
      setSelectedDate(parseISO(data.date));
    } else {
      console.error('Clicked data does not have a valid date:', data);
    }
  };

  const handleTimelineDateSelect = (date: Date) => {
    setSelectedDate(startOfDay(date))
  }

  /**
   * Generates insights for a specific date.
   * @function
   * @param {Date} date - The date for which to generate insights.
   * @returns {Insight[]} An array of insights for the given date.
   */
  const getDailyInsights = (date: Date): Insight[] => {
    if (!date || chartData.length === 0) return []

    const dateString = format(date, 'yyyy-MM-dd')
    const dailyData = chartData.find(d => d.date === dateString)
    if (!dailyData) return []

    return selectedMetrics.map(metricName => {
      const metricKey = metricName.toLowerCase().replace(' ', '_') as keyof DailyAggregation['metrics'];
      const dailyValue = dailyData.metrics[metricKey]?.score || 0
      const averageValue = chartData.reduce((sum, d) => sum + (d.metrics[metricKey]?.score || 0), 0) / chartData.length

      const fullNote = dailyData.metrics[metricKey]?.aggregated_note || '';
      const notesMatch = fullNote.match(/Notes: (.+)/);
      const notes = notesMatch ? notesMatch[1] : '';

      return {
        title: metricName,
        value: dailyValue,
        average: averageValue,
        change: dailyValue > averageValue ? 'positive' : dailyValue < averageValue ? 'negative' : 'neutral',
        aggregatedNote: notes
      }
    })
  }

  const handleUploadClick = () => {
    router.push('/maximizing/health/upload')
  }

  const getDailySummary = (date: Date) => {
    if (!date || chartData.length === 0) return { summary: '', additionalNotes: [] }

    const dateString = format(date, 'yyyy-MM-dd')
    const dailyData = chartData.find(d => d.date === dateString)
    if (!dailyData) return { summary: '', additionalNotes: [] }

    return {
      summary: dailyData.summary,
      additionalNotes: dailyData.additional_notes
    }
  }

  /**
   * Calculates the progress based on selected metrics.
   * @function
   * @param {string[]} selectedMetrics - The currently selected metrics.
   * @returns {number} The calculated progress percentage.
   */
  const calculateProgress = (selectedMetrics: string[]): number => {
    return (selectedMetrics.length / metrics.length) * 100; // Calculate progress as a percentage
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-black mb-6 text-center md:text-5xl">Maximizing Health</h1> {/* Centered title */}
      <Card className="mb-6 bg-black text-gold"> {/* Updated card styling */}
        <CardHeader className="flex flex-col md:flex-row items-center justify-between">
          <Button onClick={handleUploadClick} variant="outline" className="hover:bg-gold mb-2 md:mb-0">Upload Health Data</Button> {/* Updated button styling */}
          <DateRangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="w-full flex justify-center">
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
            </div>
          ) : (
            <div className="w-full text-center">Loading chart data...</div>
          )}
          <div className="flex flex-wrap gap-2 my-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center">
                <MetricIcon name={metric.name} />
                <Button
                  variant={selectedMetrics.includes(metric.name) ? "default" : "outline"}
                  onClick={() => handleMetricToggle(metric.name)}
                  className="rounded-full"
                  style={{ backgroundColor: selectedMetrics.includes(metric.name) ? metric.color : undefined }}
                >
                  <span className="text-lg font-medium">{metric.name}</span> {/* Updated metric button text */}
                </Button>
              </div>
            ))}
          </div>
          <ProgressBar value={calculateProgress(selectedMetrics)} />
        </CardContent>
      </Card>

      {/* Ensure TimelineNavigation takes full width */}
      <div className="w-full overflow-x-auto"> {/* Added overflow-x-auto for horizontal scrolling */}
        <TimelineNavigation 
          startDate={dateRange.startDate} 
          endDate={dateRange.endDate} 
          onDateSelect={handleTimelineDateSelect}
          selectedDate={selectedDate}
          visibleDates={3} // Show only 5 dates at a time on mobile
        />
      </div>

      {/* {selectedDate && (
        <DailySummary 
          {...getDailySummary(selectedDate)}
        />
      )} */}

      {selectedDate && (
        <DailyInsights 
          date={selectedDate}
          insights={getDailyInsights(selectedDate)}
        />
      )}
    </div>
  )
}
