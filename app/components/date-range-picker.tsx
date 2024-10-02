"use client"

import { useState } from 'react'
import  Button from "../components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { DateRange } from '../types/date-range'
import { DayPicker, DateRange as DayPickerDateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { cn } from '@/app/lib/utils'

export interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (dateRange: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [month, setMonth] = useState<Date>(value?.startDate || new Date())
    const [tempRange, setTempRange] = useState<DateRange | null>(value || null)

    const handleRangeSelect = (range: DateRange | undefined) => {
        if (range?.startDate) {
            if (range.endDate) {
                const newRange: DateRange = { startDate: range.startDate, endDate: range.endDate }
                setTempRange(newRange);
                onChange(newRange);
                setIsOpen(false);
            } else {
                // Only start date selected, update temp range but keep picker open
                setTempRange({ startDate: range.startDate, endDate: range.startDate });
            }
        } else {
            // Reset the range
            setTempRange(null);
        }
    };

    const handlePresetSelect = (preset: string) => {
        const today = new Date()
        let newRange: DateRange

        switch (preset) {
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
                return
        }

        onChange(newRange)
        setIsOpen(false)
    }

    const handlePreviousMonth = () => {
        setMonth(prevMonth => subMonths(prevMonth, 1))
    }

    const handleNextMonth = () => {
        setMonth(prevMonth => addMonths(prevMonth, 1))
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                    "w-[280px] justify-between text-left font-normal",
                    !value && "text-muted-foreground"
                )}>
                    <span className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.startDate ? (
                            value.endDate ? (
                                <>
                                    {format(value.startDate, "LLL dd, y")} - {format(value.endDate, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.startDate, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-md p-0 mx-auto" align="center" sideOffset={8}>
                <div className="bg-white border rounded-md shadow-md">
                    <div className="space-y-2 p-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('today')}>Today</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('yesterday')}>Yesterday</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('thisWeek')}>This Week</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('lastWeek')}>Last Week</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('thisMonth')}>This Month</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePresetSelect('lastMonth')}>Last Month</Button>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousMonth}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </Button>
                                <div className="font-medium text-sm">
                                    {format(month, 'MMMM yyyy')}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextMonth}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <style jsx global>{`
                                .rdp-caption {
                                    display: none !important;
                                }
                            `}</style>
                            <DayPicker
                                mode="range"
                                month={month}
                                selected={value ? { from: value.startDate, to: value.endDate } : undefined}
                                onSelect={(selectedRange) => {
                                    if (selectedRange?.from && selectedRange?.to) {
                                        handleRangeSelect({ startDate: selectedRange.from, endDate: selectedRange.to });
                                    }
                                }}
                                numberOfMonths={1}
                                className={cn("p-0", "rdp-caption-hidden")}
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-2",
                                    caption: "hidden !important", // Ensure caption is hidden
                                    caption_label: "hidden !important", // Ensure caption label is hidden
                                    nav: "hidden",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                    row: "flex w-full mt-1",
                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    day_today: "bg-accent text-accent-foreground",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}