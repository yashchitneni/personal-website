'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

type Metric = {
  score: number
  notes: string
}

type ChartData = {
  date: string
  time: string
  metrics: {
    [key: string]: Metric
  }
  additional_notes: string[]
  summary: string
}

export type BiofeedbackChartProps = {
  data: ChartData[]
  selectedMetrics: string[]
  metrics: { name: string; color: string }[]
  onDataPointClick: (data: ChartData) => void
}

export function BiofeedbackChart({ data, selectedMetrics, metrics, onDataPointClick }: BiofeedbackChartProps) {
  const chartData = data.map(entry => ({
    date: entry.date,
    ...Object.fromEntries(
      Object.entries(entry.metrics).map(([key, value]) => [key, value.score])
    )
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} onClick={(data) => {
          if (data?.activePayload?.[0]?.payload) {
            onDataPointClick(data.activePayload[0].payload as ChartData);
          }
        }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(parseISO(value), 'd')}
            interval={Math.floor(chartData.length / 10)}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip 
            labelFormatter={(value) => format(parseISO(value), 'MMMM d, yyyy')}
            formatter={(value) => [(value as number).toFixed(2), '']}
          />
          <Legend />
          {selectedMetrics.map((metric) => (
            <Line 
              key={metric} 
              type="monotone" 
              dataKey={metric} 
              stroke={metrics.find(m => m.name === metric)?.color}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}