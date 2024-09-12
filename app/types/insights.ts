export interface Insight {
    title: string
    value: string | number
    change?: 'positive' | 'negative' | 'neutral'
}
  
export interface DailyInsightsProps {
    date: Date
    insights: Insight[]
  }