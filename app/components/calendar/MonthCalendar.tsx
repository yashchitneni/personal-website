'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface MonthCalendarProps {
  year: number;
  month: number;
  entries?: {
    date: string;
    image_url: string | null;
  }[];
}

export function MonthCalendar({ year, month, entries = [] }: MonthCalendarProps) {
  const router = useRouter();

  const getDaysInMonth = () => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(year, month, 1).getDay();
  };

  const handleDayClick = (day: number) => {
    const monthName = format(new Date(year, month), 'MMMM').toLowerCase();
    router.push(`/maximizing/${monthName}/${day}`);
  };

  return (
    <div className="grid grid-cols-7 gap-2 text-center">
      {/* Day headers */}
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
        <div key={day} className="text-xs font-medium text-gray-500 mb-2">
          {day}
        </div>
      ))}
      
      {/* Empty cells for first week */}
      {Array.from({ length: getFirstDayOfMonth() }).map((_, i) => (
        <div key={`empty-${i}`} className="aspect-square" />
      ))}
      
      {/* Day cells */}
      {Array.from({ length: getDaysInMonth() }).map((_, i) => {
        const day = i + 1;
        const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entries.find(e => e.date === currentDate);
        const isToday = currentDate === format(new Date(), 'yyyy-MM-dd');
        
        return (
          <button
            key={`day-${day}`}
            onClick={() => handleDayClick(day)}
            className={`
              relative aspect-square p-1 rounded-lg
              hover:bg-gray-50 transition-colors
              ${entry?.image_url ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white'}
              ${isToday ? 'ring-2 ring-blue-400' : ''}
            `}
          >
            <div className="text-sm font-medium">{day}</div>
            {entry?.image_url && (
              <div className="absolute inset-1 mt-5 bg-blue-200 rounded opacity-50" />
            )}
          </button>
        );
      })}
    </div>
  );
} 