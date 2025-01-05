import { notFound } from 'next/navigation';
import { getDayFromOrdinal } from '@/app/utils/date';
import { DayImageUploader } from './DayImageUploader';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';

const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

interface PageProps {
  params: {
    month: string;
    day: string;
  };
}

export default async function DayPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });
  const monthIndex = months.indexOf(params.month.toLowerCase());
  const day = getDayFromOrdinal(params.day);
  
  if (monthIndex === -1 || isNaN(day)) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, monthIndex, day);
  const formattedDate = date.toISOString().split('T')[0];
  const isToday = new Date().toDateString() === date.toDateString();

  // Get session and entry data
  const { data: { session } } = await supabase.auth.getSession();
  const { data: entry } = session ? await supabase
    .from('daily_entries')
    .select('image_url')
    .eq('date', formattedDate)
    .eq('user_id', session.user.id)
    .single() : { data: null };

  const monthName = months[monthIndex].charAt(0).toUpperCase() + months[monthIndex].slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="gallery-frame bg-white rounded-lg shadow-2xl p-8 border border-gray-100">
          {/* Artistic date display */}
          <div className="relative mb-8 text-center">
            <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 text-sm text-gray-500">
              {currentYear}
            </span>
            <h1 className="font-serif text-6xl text-gray-900 tracking-tight mb-2">
              {day}
            </h1>
            <p className="font-light text-2xl text-gray-600 tracking-widest uppercase">
              {monthName}
            </p>
            {isToday && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Today
                </span>
              </div>
            )}
          </div>

          {/* Exhibition space */}
          <div className="exhibition-space relative aspect-[1/1.2] w-full">
            {entry?.image_url ? (
              <Image
                src={entry.image_url}
                alt={`Memory from ${monthName} ${day}, ${currentYear}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                quality={100}
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50 border-t border-gray-100">
                <div className="text-center p-8">
                  <div className="mb-4">
                    <div className="inline-block p-3 rounded-full bg-gray-100">
                      {isToday ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <span className="text-blue-500 text-xl">Today</span>
                        </div>
                      ) : date > new Date() ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                          <span className="text-purple-500 text-xl">Future</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                          <span className="text-gray-500 text-xl">Past</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl font-serif text-gray-900 mb-2">
                    {isToday 
                      ? "Today's Canvas"
                      : date > new Date()
                        ? "A Future Memory"
                        : "A Moment in Time"
                    }
                  </h2>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {isToday 
                      ? "This moment is being crafted"
                      : date > new Date()
                        ? "This story has yet to unfold"
                        : "This space awaits its memory"
                    }
                  </p>
                  {session && isToday && (
                    <div className="mt-6">
                      <DayImageUploader date={date} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  const currentYear = new Date().getFullYear();
  const params: { month: string; day: string; }[] = [];
  
  months.forEach((month, monthIndex) => {
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const ordinalDay = day.toString();
      params.push({
        month,
        day: ordinalDay,
      });
    }
  });
  
  return params;
} 