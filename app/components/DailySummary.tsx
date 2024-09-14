import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

interface DailySummaryProps {
  summary: string;
  additionalNotes: string[];
}

export function DailySummary({ summary, additionalNotes }: DailySummaryProps) {
  return (
    <Card className="mt-4 mb-4">
      <CardHeader>
        <CardTitle className="text-center">Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">{summary}</p>
        {additionalNotes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Additional Notes:</h4>
            <ul className="list-disc list-inside">
              {additionalNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}