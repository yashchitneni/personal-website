import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Insight, DailyInsightsProps } from "../types/insights"

export function DailyInsights({ date, insights }: DailyInsightsProps) {
  if (insights.length === 0) {
    return <p>No insights available for this date.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
            <div className="flex items-center">
              {insight.average !== undefined && (
                <span className="text-sm mr-2">Avg: {insight.average.toFixed(2)}</span>
              )}
              {insight.change && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className={`h-4 w-4 ${
                    insight.change === 'positive' 
                      ? 'text-green-500' 
                      : insight.change === 'negative'
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                >
                  {insight.change === 'positive' && <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />}
                  {insight.change === 'negative' && <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />}
                  {insight.change === 'neutral' && <line x1="5" y1="12" x2="19" y2="12" />}
                </svg>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {typeof insight.value === 'number' ? insight.value.toFixed(2) : insight.value}
            </div>
            {insight.aggregatedNote && (
              <div className="text-sm text-gray-600 mt-2">
                {insight.aggregatedNote}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}