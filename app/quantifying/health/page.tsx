'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BiofeedbackChart } from '../../components/BiofeedbackChart'
import { DateRangePicker } from '../../components/date-range-picker'
import { AnimatedTitle } from '../../components/AnimatedTitle'
import { DateRange } from '../../../types/date-range'

export default function HealthPage() {
  const router = useRouter()

  const handleUploadClick = () => {
    router.push('/quantifying/health/upload')
  }

  const handleRangeChange = (range: DateRange) => {
    // Handle the date range change
    console.log(range)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedTitle>Quantifying Health</AnimatedTitle>
      <div className="mb-6">
        <DateRangePicker onRangeChange={handleRangeChange} />
      </div>
      <div className="mb-6">
        <Button onClick={handleUploadClick}>Upload Health Data</Button>
      </div>
      <BiofeedbackChart data={[]} selectedMetrics={[]} metrics={[]} onDataPointClick={function (data: { date: string; time: string; metrics: { [key: string]: { score: number; notes: string } }; additional_notes: string[]; summary: string }): void {
        throw new Error('Function not implemented.')
      } } />
      {/* ... other components ... */}
    </div>
  )
}