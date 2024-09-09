"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import * as Popover from '@radix-ui/react-popover'
import * as Select from '@radix-ui/react-select'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from '../../types/date-range'

export interface DateRangePickerProps {
  onRangeChange: (range: DateRange) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) })

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range)
    onRangeChange(range)
  }

  const handlePresetSelect = (value: string) => {
    const today = new Date()
    let newRange: DateRange

    switch (value) {
      case 'today':
        newRange = { startDate: today, endDate: today }
        break
      case 'yesterday':
        const yesterday = subDays(today, 1)
        newRange = { startDate: yesterday, endDate: yesterday }
        break
      case 'thisWeek':
        newRange = { startDate: startOfWeek(today), endDate: endOfWeek(today) }
        break
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7))
        newRange = { startDate: lastWeekStart, endDate: endOfWeek(lastWeekStart) }
        break
      case 'thisMonth':
        newRange = { startDate: startOfMonth(today), endDate: endOfMonth(today) }
        break
      case 'lastMonth':
        const lastMonthStart = startOfMonth(subDays(today, 30))
        newRange = { startDate: lastMonthStart, endDate: endOfMonth(lastMonthStart) }
        break
      default:
        newRange = dateRange
    }

    handleRangeChange(newRange)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.startDate ? (
            dateRange.endDate ? (
              <>
                {format(dateRange.startDate, "LLL dd, y")} - {format(dateRange.endDate, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.startDate, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0" align="end">
        <Select.Root onValueChange={handlePresetSelect}>
          <Select.Trigger>
            <Select.Value placeholder="Select range" />
          </Select.Trigger>
          <Select.Content position="popper">
            <Select.Item value="today">Today</Select.Item>
            <Select.Item value="yesterday">Yesterday</Select.Item>
            <Select.Item value="thisWeek">This Week</Select.Item>
            <Select.Item value="lastWeek">Last Week</Select.Item>
            <Select.Item value="thisMonth">This Month</Select.Item>
            <Select.Item value="lastMonth">Last Month</Select.Item>
          </Select.Content>
        </Select.Root>
        {/* For the Calendar component, we'll need to implement a custom one or use a different library */}
        <div>Calendar placeholder</div>
      </Popover.Content>
    </Popover.Root>
  )
}