import { MonthCalendar } from '@/app/components/calendar/MonthCalendar';
import { notFound } from 'next/navigation';

const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

interface MonthPageProps {
  params: {
    month: string;
  };
}

export default function MonthPage({ params }: MonthPageProps) {
  const monthIndex = months.indexOf(params.month.toLowerCase());
  
  if (monthIndex === -1) {
    notFound();
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <MonthCalendar 
        year={currentYear}
        month={monthIndex}
      />
    </div>
  );
}

export function generateStaticParams() {
  return months.map((month) => ({
    month: month,
  }));
} 