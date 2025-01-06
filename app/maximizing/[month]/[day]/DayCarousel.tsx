'use client';

import { useRouter } from 'next/navigation';
import { DayImageUploader } from './DayImageUploader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getOrdinalSuffix } from '@/app/utils/date';

const months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

interface DailyEntry {
  image_url: string | null;
  user_id: string;
  date: string;
}

interface Session {
  user: {
    id: string;
  };
}

interface DayCardProps {
  date: Date;
  entry: DailyEntry | null;
  isPreview?: boolean;
  isToday?: boolean;
  session?: Session | null;
}

interface CarouselProps {
  initialDate: Date;
  initialEntry: DailyEntry | null;
}

export function DayCarousel({ initialDate, initialEntry }: CarouselProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(initialEntry);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const date = initialDate;
  const formattedDate = date.toISOString().split('T')[0];
  const isToday = new Date().toDateString() === date.toDateString();

  // Calculate adjacent dates while preserving the year
  const prevDate = new Date(date);
  prevDate.setDate(date.getDate() - 1);
  if (prevDate.getFullYear() !== date.getFullYear()) {
    prevDate.setFullYear(date.getFullYear());
    prevDate.setMonth(11);
    prevDate.setDate(31);
  }

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);
  if (nextDate.getFullYear() !== date.getFullYear()) {
    nextDate.setFullYear(date.getFullYear());
    nextDate.setMonth(0);
    nextDate.setDate(1);
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data } = await supabase
          .from('daily_entries')
          .select('image_url, user_id, date')
          .eq('date', formattedDate)
          .eq('user_id', session.user.id)
          .single();
        setEntry(data as DailyEntry | null);
      }
    };
    fetchData();
  }, [formattedDate, supabase]);

  const navigateToDate = (targetDate: Date) => {
    setIsTransitioning(true);
    const month = months[targetDate.getMonth()];
    const day = targetDate.getDate().toString() + getOrdinalSuffix(targetDate.getDate());
    router.push(`/maximizing/${month}/${day}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <div className="relative w-full h-screen flex flex-col items-center pt-12">
        {/* Date Header */}
        <motion.div 
          className="text-center mb-8"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-medium text-gray-500 tracking-wider">
            {date.getFullYear()}
          </span>
          <div className="flex items-baseline justify-center gap-3 mb-1">
            <h1 className="font-serif text-6xl text-gray-900 tracking-tight leading-none">
              {date.getDate()}
            </h1>
            <p className="font-light text-2xl text-gray-600 tracking-widest uppercase">
              {months[date.getMonth()].charAt(0).toUpperCase() + months[date.getMonth()].slice(1)}
            </p>
          </div>
          {isToday && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Today
            </span>
          )}
        </motion.div>

        {/* Polaroid Carousel */}
        <div className="relative w-full flex items-center justify-center mb-8">
          <motion.div 
            className="absolute w-[250px] left-[-30px] opacity-20 cursor-pointer"
            style={{ 
              perspective: 1000,
              rotateY: '15deg',
              filter: 'blur(1px)'
            }}
            whileHover={{ 
              opacity: 0.4,
              filter: 'blur(0px)',
              x: 10,
              transition: { duration: 0.2 }
            }}
            onClick={() => !isTransitioning && navigateToDate(prevDate)}
          >
            <DayCard date={prevDate} entry={null} isPreview />
          </motion.div>

          <motion.div 
            className="w-[300px] z-10"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (isTransitioning) return;
              if (info.offset.x < -100) navigateToDate(nextDate);
              if (info.offset.x > 100) navigateToDate(prevDate);
            }}
            dragElastic={0.2}
            whileDrag={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            layout
          >
            <DayCard date={date} entry={entry} isToday={isToday} session={session} />
          </motion.div>

          <motion.div 
            className="absolute w-[250px] right-[-30px] opacity-20 cursor-pointer"
            style={{ 
              perspective: 1000,
              rotateY: '-15deg',
              filter: 'blur(1px)'
            }}
            whileHover={{ 
              opacity: 0.4,
              filter: 'blur(0px)',
              x: -10,
              transition: { duration: 0.2 }
            }}
            onClick={() => !isTransitioning && navigateToDate(nextDate)}
          >
            <DayCard date={nextDate} entry={null} isPreview />
          </motion.div>
        </div>

        {/* Space for Additional Content */}
        <motion.div 
          className="w-full max-w-2xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">Voice Note / Journal Entry Coming Soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DayCard({ date, entry, isPreview = false, isToday = false, session = null }: DayCardProps) {
  const monthName = months[date.getMonth()].charAt(0).toUpperCase() + months[date.getMonth()].slice(1);
  const day = date.getDate();

  return (
    <motion.div 
      className={`gallery-frame bg-white rounded-sm shadow-2xl h-full overflow-hidden
        ${isPreview ? 'pointer-events-none' : ''}`}
      style={{
        aspectRatio: '54/86',
        padding: '0.29rem 0.16rem 0.62rem 0.16rem', // Matching Instax Mini borders
      }}
      initial={isPreview ? {} : { scale: 0.95, opacity: 0 }}
      animate={isPreview ? {} : { scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full w-full bg-gray-50">
        {entry?.image_url ? (
          <div className="relative w-full h-full">
            <Image
              src={entry.image_url}
              alt={`Memory from ${monthName} ${day}, ${date.getFullYear()}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              quality={100}
              unoptimized
            />
          </div>
        ) : !isPreview && (
          <div className="h-full w-full flex flex-col items-center justify-center">
            {session && isToday ? (
              <DayImageUploader date={date} />
            ) : (
              <div className="p-4 text-center">
                <div className="inline-block p-2 rounded-full bg-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      {isToday ? "Add" : date > new Date() ? "Soon" : "Empty"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
} 