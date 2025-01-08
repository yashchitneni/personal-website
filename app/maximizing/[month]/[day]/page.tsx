import { notFound } from 'next/navigation';
import { getDayFromOrdinal } from '@/app/utils/date';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DayCarousel } from './DayCarousel';
import { format } from 'date-fns';

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

  // Create date and validate it's a real date
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, monthIndex, day, 12, 0, 0, 0); // Set to noon to avoid timezone issues
  
  // Check if the date is valid and the day matches
  // This catches invalid dates like February 31st
  if (date.getMonth() !== monthIndex || date.getDate() !== day) {
    notFound();
  }

  // Format date for database query
  const formattedDate = format(date, 'yyyy-MM-dd');

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