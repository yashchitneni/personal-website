'use client';

import { YearCalendar } from '@/app/components/calendar/YearCalendar';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DailyEntry {
  date: string;
  image_url: string | null;
}

export default function MaximizingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkAuthAndFetchEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        // Fetch entries for the current year
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;
        
        const { data: dailyEntries, error } = await supabase
          .from('daily_entries')
          .select('date, image_url')
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching entries:', error);
        }

        if (dailyEntries) {
          console.log('Fetched entries:', dailyEntries);
          setEntries(dailyEntries);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthAndFetchEntries();
  }, [supabase.auth, currentYear]);

  // Debug log when entries change
  useEffect(() => {
    console.log('Current entries state:', entries);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-fluid px-2">
        <div className="flex justify-between items-center py-4">
          {isAuthenticated ? (
            <Link 
              href="/maximizing/upload"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              Upload Today's Memory
            </Link>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              Sign in to Upload
            </button>
          )}
          <Link 
            href="/maximizing/health" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Health
          </Link>
        </div>
        <div className="bg-white">
          <YearCalendar year={currentYear} entries={entries} />
        </div>
      </div>
    </div>
  );
}