'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getOrdinalSuffix } from '@/app/utils/date';
import Image from 'next/image';

interface YearCalendarProps {
  year: number;
  entries?: {
    date: string;
    image_url: string | null;
  }[];
}

const months = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const fullMonths = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function YearCalendar({ year, entries = [] }: YearCalendarProps) {
  const router = useRouter();

  const handleDayClick = (month: number, day: number) => {
    const monthName = fullMonths[month];
    const ordinalDay = getOrdinalSuffix(day);
    router.push(`/maximizing/${monthName}/${ordinalDay}`);
  };

  // Adjust for leap year
  const getDaysInMonth = (monthIndex: number) => {
    if (monthIndex === 1) { // February
      return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28;
    }
    return daysInMonth[monthIndex];
  };

  const generateMonthRow = (monthIndex: number) => {
    const totalDays = getDaysInMonth(monthIndex);
    const cells = [];

    for (let day = 1; day <= 31; day++) {
      if (day <= totalDays) {
        const date = new Date(year, monthIndex, day);
        const dayOfWeek = format(date, 'EEE').toUpperCase();
        const isWeekend = [0, 6].includes(date.getDay());
        const currentDate = format(date, 'yyyy-MM-dd');
        const entry = entries.find(e => e.date === currentDate);

        // Debug log
        if (entry?.image_url) {
          console.log(`Found image for ${currentDate}:`, entry.image_url);
        }

        cells.push(
          <div 
            key={`${monthIndex}-${day}`} 
            className={`
              group/cell flex flex-col border-l first:border-l-0
              ${isWeekend ? 'bg-gray-100' : ''}
              relative
              before:absolute before:inset-0 before:pointer-events-none
              before:opacity-0 before:transition-opacity
              before:border-2 before:border-blue-400
              hover:before:opacity-100
              before:z-10
            `}
          >
            {/* Header showing day and date for each column */}
            <div className="text-[10px] leading-tight px-1 py-0.5 border-b font-medium whitespace-nowrap overflow-hidden">
              {dayOfWeek} {day}
            </div>
            {/* Cell container with fixed aspect ratio */}
            <div className="w-full" style={{ paddingBottom: '62.79%', position: 'relative' }}>
              <button
                onClick={() => handleDayClick(monthIndex, day)}
                className="absolute inset-0 w-full h-full"
              >
                <div className="absolute inset-0 p-0.5">
                  <div className={`
                    w-full h-full rounded-sm
                    ${entry?.image_url ? 'bg-white shadow-sm' : 'bg-transparent'}
                    transition-shadow duration-200
                  `}>
                    {entry?.image_url && (
                      <div className="relative w-full h-full">
                        <Image
                          src={decodeURIComponent(entry.image_url)}
                          alt={`Image for ${months[monthIndex]} ${day}`}
                          fill
                          className="object-cover rounded-sm"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                          onError={(e) => {
                            console.error('Image failed to load:', entry.image_url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
      } else {
        // Empty cell for months with fewer than 31 days
        cells.push(
          <div key={`empty-${monthIndex}-${day}`} className="border-l first:border-l-0">
            <div className="text-[10px] leading-tight px-1 py-0.5 border-b opacity-0">.</div>
            <div className="w-full" style={{ paddingBottom: '62.79%', position: 'relative' }}>
              <div className="absolute inset-0" />
            </div>
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-center mb-6">{year}</h1>
      
      <div className="border border-gray-200">
        {months.map((month, monthIndex) => (
          <div key={month} className="flex border-b last:border-b-0">
            {/* Month name */}
            <div className="w-20 shrink-0 p-2 border-r font-medium">
              {month}
            </div>

            {/* Days grid */}
            <div className="flex-1 grid grid-cols-31">
              {generateMonthRow(monthIndex)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 