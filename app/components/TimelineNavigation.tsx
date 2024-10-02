'use client'

import { useState, useEffect, useRef } from 'react'
import Button from "../components/ui/button"
import { Card, CardContent } from "../components/ui/Card"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'

interface TimelineNavigationProps {
  startDate: Date;
  endDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  visibleDates?: number; // Add this line
}

export function TimelineNavigation({ startDate, endDate, onDateSelect, selectedDate }: TimelineNavigationProps) {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0)
  const [visibleDates, setVisibleDates] = useState(3) // Default value
  const containerRef = useRef<HTMLDivElement | null>(null)

  const dates = eachDayOfInterval({ start: startDate, end: endDate })
  const visibleDatesArray = dates.slice(visibleStartIndex, visibleStartIndex + visibleDates)

  const handleScrollLeft = () => {
    setVisibleStartIndex(Math.max(0, visibleStartIndex - 1))
  }

  const handleScrollRight = () => {
    setVisibleStartIndex(Math.min(dates.length - visibleDates, visibleStartIndex + 1))
  }

  const updateVisibleDates = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const dateButtonWidth = 80; // Approximate width of each date button
      const newVisibleDates = Math.floor(containerWidth / dateButtonWidth);
      setVisibleDates(newVisibleDates);
    }
  }

  useEffect(() => {
    updateVisibleDates() // Initial calculation
    window.addEventListener('resize', updateVisibleDates) // Update on resize

    return () => {
      window.removeEventListener('resize', updateVisibleDates) // Cleanup
    }
  }, [])

  return (
    <Card className="mt-4">
      <CardContent className="p-2">
        <div className="flex items-center justify-between" ref={containerRef}>
          <Button variant="outline" onClick={handleScrollLeft} disabled={visibleStartIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex justify-between px-2">
            {visibleDatesArray.map((date) => (
              <Button
                key={date.toISOString()}
                variant={selectedDate && isSameDay(date, selectedDate) ? "default" : "ghost"}
                className={`flex-1 text-sm ${
                  isSameDay(date, new Date()) ? 'bg-secondary text-secondary-foreground' : ''
                }`}
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
            disabled={visibleStartIndex >= dates.length - visibleDates}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}