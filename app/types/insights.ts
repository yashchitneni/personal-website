export interface Insight {
    title: string
    value: string | number
    change?: 'positive' | 'negative' | 'neutral'
    average?: number
    aggregatedNote?: string  // Add this line
}

export interface DailyInsightsProps {
    date: Date
    insights: Insight[]
  }