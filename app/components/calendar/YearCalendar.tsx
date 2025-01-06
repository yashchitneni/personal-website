'use client';

import { useRouter } from 'next/navigation';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import { getOrdinalSuffix } from '@/app/utils/date';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface YearCalendarProps {
  year: number;
  entries?: {
    date: string;
    image_url: string | null;
  }[];
}

const quarters = [
  { label: 'Q1', months: ['January', 'February', 'March'] },
  { label: 'Q2', months: ['April', 'May', 'June'] },
  { label: 'Q3', months: ['July', 'August', 'September'] },
  { label: 'Q4', months: ['October', 'November', 'December'] }
];

export function YearCalendar({ year, entries = [] }: YearCalendarProps) {
  const router = useRouter();
  const [expandedQuarter, setExpandedQuarter] = useState<number | null>(null);

  const handleDayClick = (monthName: string, day: number) => {
    router.push(`/maximizing/${monthName.toLowerCase()}/${getOrdinalSuffix(day)}`);
  };

  const handleQuarterClick = (quarterIndex: number) => {
    router.push(`/maximizing/quarter/${quarterIndex + 1}`);
  };

  const renderMonthCalendar = (monthName: string, monthIndex: number) => {
    const daysInMonth = getDaysInMonth(new Date(year, monthIndex));
    const firstDayOfMonth = startOfMonth(new Date(year, monthIndex)).getDay();
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === monthIndex;
    });

    return (
      <div key={monthName} className="bg-white rounded-lg shadow p-4">
        <h3 className="text-xl font-semibold mb-4">{monthName}</h3>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 text-center p-1">
              {day}
            </div>
          ))}
          
          {/* Empty cells for first week */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-start-${i}`} className="aspect-square" />
          ))}
          
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, monthIndex, day);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const entry = monthEntries.find(e => e.date === formattedDate);
            const isWeekend = [0, 6].includes(date.getDay());

            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDayClick(monthName, day)}
                className={`
                  relative aspect-square p-0.5 group
                  ${isWeekend ? 'bg-gray-50' : 'bg-white'}
                  hover:z-10
                `}
              >
                <div className={`
                  relative w-full h-full rounded
                  ${entry?.image_url ? 'shadow-sm' : ''}
                  group-hover:ring-2 group-hover:ring-blue-400
                  transition-all duration-200
                `}>
                  {/* Day number */}
                  <div className={`
                    absolute top-1 left-1 text-xs font-medium z-10
                    ${entry?.image_url ? 'text-white' : 'text-gray-600'}
                  `}>
                    {day}
                  </div>
                  
                  {/* Image */}
                  {entry?.image_url && (
                    <div className="absolute inset-0">
                      <Image
                        src={decodeURIComponent(entry.image_url)}
                        alt={`Preview for ${monthName} ${day}`}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuarterPanel = (quarterIndex: number) => {
    const quarter = quarters[quarterIndex];
    const isExpanded = expandedQuarter === quarterIndex;
    
    return (
      <motion.div
        key={quarter.label}
        layout
        className={`
          relative overflow-hidden
          ${isExpanded ? 'col-span-2 row-span-2' : ''}
        `}
      >
        <motion.button
          onClick={() => handleQuarterClick(quarterIndex)}
          className="w-full h-full"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className={`
            bg-white rounded-2xl shadow-lg p-8
            h-full w-full min-h-[300px]
            flex flex-col items-center justify-center
            transition-all duration-300
            ${isExpanded ? 'opacity-0' : 'opacity-100'}
          `}>
            <h2 className="text-6xl font-bold mb-6 text-gray-800">{quarter.label}</h2>
            <div className="text-gray-500 text-center space-y-2">
              {quarter.months.map((month) => (
                <div key={month} className="text-lg">
                  {month}
                </div>
              ))}
            </div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white rounded-2xl shadow-lg p-6 overflow-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{quarter.label}</h2>
                <button
                  onClick={() => setExpandedQuarter(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              
              <div className="grid gap-6">
                {quarter.months.map((monthName, monthOffset) => {
                  const monthIndex = quarterIndex * 3 + monthOffset;
                  return renderMonthCalendar(monthName, monthIndex);
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <motion.h1 
        className="text-6xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {year} Journey
      </motion.h1>
      
      <motion.div 
        className="grid grid-cols-2 grid-rows-2 gap-8 aspect-square"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {quarters.map((_, index) => renderQuarterPanel(index))}
      </motion.div>
    </div>
  );
} 