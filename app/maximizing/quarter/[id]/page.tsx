import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuarterView } from '@/app/components/calendar/QuarterView';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface QuarterPageProps {
  params: {
    id: string;
  };
}

export default async function QuarterPage({ params }: QuarterPageProps) {
  // Validate quarter format (1, 2, 3, 4)
  const quarterId = parseInt(params.id);
  if (isNaN(quarterId) || quarterId < 1 || quarterId > 4) {
    notFound();
  }

  const quarterIndex = quarterId - 1;
  const currentYear = new Date().getFullYear();

  // Get entries for this quarter
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const startMonth = quarterIndex * 3;
  const endMonth = startMonth + 2;
  
  // Create dates in UTC to ensure consistent handling
  const startDate = toZonedTime(new Date(currentYear, startMonth, 1), 'UTC');
  const endDate = toZonedTime(new Date(currentYear, endMonth + 1, 0), 'UTC');

  // Format dates for database query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  // Debug log the date range
  console.log('Fetching entries for date range:', {
    startDate: startDateStr,
    endDate: endDateStr,
    quarterIndex,
    startMonth,
    endMonth
  });

  const { data: entries } = session ? await supabase
    .from('daily_entries')
    .select('date, image_url')
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .eq('user_id', session.user.id) : { data: [] };

  // Debug log the fetched entries
  console.log('Fetched entries:', entries);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <QuarterView
        year={currentYear}
        quarterIndex={quarterIndex}
        entries={entries || []}
      />
    </div>
  );
} 