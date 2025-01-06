import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuarterView } from '@/app/components/calendar/QuarterView';

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
  
  const startDate = new Date(currentYear, startMonth, 1);
  const endDate = new Date(currentYear, endMonth + 1, 0); // Last day of the last month

  const { data: entries } = session ? await supabase
    .from('daily_entries')
    .select('date, image_url')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .eq('user_id', session.user.id) : { data: [] };

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