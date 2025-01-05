'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  entries?: {
    date: string;
    image_url?: string;
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
    <div className="w-full max-w-4xl mx-auto p-4">
      <button
        onClick={() => router.push('/maximizing')}
        className="mb-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        ← Back to Year View
      </button>
      <div className="border rounded-lg p-6 bg-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {format(new Date(year, month), 'MMMM yyyy')}
        </h2>
        
        <div className="grid grid-cols-7 gap-4 text-center">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {Array.from({ length: getFirstDayOfMonth() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: getDaysInMonth() }).map((_, i) => {
            const day = i + 1;
            const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = entries.find(e => e.date === currentDate);
            
            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square p-2 border rounded-lg
                  hover:bg-gray-50 transition-colors
                  ${entry?.image_url ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white'}
                `}
              >
                <div className="font-medium">{day}</div>
                {entry?.image_url && (
                  <div className="mt-1 w-full h-3/4 bg-gray-200 rounded">
                    {/* Image thumbnail will go here */}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 