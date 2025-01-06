import { notFound } from 'next/navigation';
import { getDayFromOrdinal } from '@/app/utils/date';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DayCarousel } from './DayCarousel';

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

  // Get initial entry data
  const { data: { session } } = await supabase.auth.getSession();
  const { data: entry } = session ? await supabase
    .from('daily_entries')
    .select('image_url, user_id, date')
    .eq('date', formattedDate)
    .eq('user_id', session.user.id)
    .single() : { data: null };

  return <DayCarousel initialDate={date} initialEntry={entry} />;
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