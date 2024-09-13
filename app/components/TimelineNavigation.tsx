'use client'

import { useState } from 'react'
import Button from "../components/ui/button"
import { Card, CardContent } from "../components/ui/Card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'

type TimelineNavigationProps = {
  startDate: Date
  endDate: Date
  onDateSelect: (date: Date) => void
}

export function TimelineNavigation({ startDate, endDate, onDateSelect }: TimelineNavigationProps) {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0)
  const dates = eachDayOfInterval({ start: startDate, end: endDate })
  const visibleDates = dates.slice(visibleStartIndex, visibleStartIndex + 7)

  const handleScrollLeft = () => {
    setVisibleStartIndex(Math.max(0, visibleStartIndex - 1))
  }

  const handleScrollRight = () => {
    setVisibleStartIndex(Math.min(dates.length - 7, visibleStartIndex + 1))
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleScrollLeft} disabled={visibleStartIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex justify-between px-2">
            {visibleDates.map((date) => (
              <Button
                key={date.toISOString()}
                variant="ghost"
                className={`flex-1 text-sm ${isSameDay(date, new Date()) ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => onDateSelect(date)}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs">{format(date, 'EEE')}</span>
                  <span className="text-lg font-bold">{format(date, 'd')}</span>
                </div>
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            onClick={handleScrollRight} 
            disabled={visibleStartIndex >= dates.length - 7}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}