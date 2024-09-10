'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BiofeedbackChart } from '../../components/BiofeedbackChart'
import { DateRangePicker } from '../../components/date-range-picker'
import { AnimatedTitle } from '../../components/AnimatedTitle'
import { DateRange } from '../../../types/date-range'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'

export default function HealthPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange>()

  const handleUploadClick = () => {
    router.push('/quantifying/health/upload')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedTitle>Quantifying Health</AnimatedTitle>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <Button onClick={handleUploadClick} variant="outline">Upload Health Data</Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </CardHeader>
        <CardContent>
          <BiofeedbackChart 
            data={[]} 
            selectedMetrics={[]} 
            metrics={[]} 
            onDataPointClick={() => {}} 
          />
        </CardContent>
      </Card>
    </div>
  )
}