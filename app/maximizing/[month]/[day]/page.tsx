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
      <div className="max-w-lg mx-auto pt-12 px-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {monthName} {day}, {currentYear}
          </h1>
          {isToday && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Today
            </span>
          )}
        </div>

        {entry?.image_url ? (
          <div className="relative aspect-[1/1.2] w-full">
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
          </div>
        ) : session ? (
          <DayImageUploader date={date} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Sign in to upload a memory for this day</p>
          </div>
        )}
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