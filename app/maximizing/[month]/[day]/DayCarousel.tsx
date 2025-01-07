'use client';

import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
import { getOrdinalSuffix } from '@/app/utils/date';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MemoryScene } from '@/app/components/three/scene/MemoryScene';
import { toZonedTime } from 'date-fns-tz';

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
  const [entries, setEntries] = useState<{ [key: string]: DailyEntry | null }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = toZonedTime(initialDate, timezone);
  const prevDate = subDays(date, 1);
  const nextDate = addDays(date, 1);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Fetch entries for current, previous, and next day
        const dates = [
          format(toZonedTime(prevDate, timezone), 'yyyy-MM-dd'),
          format(toZonedTime(date, timezone), 'yyyy-MM-dd'),
          format(toZonedTime(nextDate, timezone), 'yyyy-MM-dd')
        ];

        const { data } = await supabase
          .from('daily_entries')
          .select('image_url, user_id, date')
          .in('date', dates)
          .eq('user_id', session.user.id);

        const entriesMap = (data || []).reduce((acc, entry) => {
          acc[entry.date] = entry;
          return acc;
        }, {} as { [key: string]: DailyEntry });

        setEntries(entriesMap);
      }
    };
    fetchData();
  }, [date, supabase]);

  const navigateToDate = (targetDate: Date) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const monthName = format(targetDate, 'MMMM').toLowerCase();
    const day = getOrdinalSuffix(targetDate.getDate());
    router.push(`/maximizing/${monthName}/${day}`);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const currentEntry = entries[format(date, 'yyyy-MM-dd')] || initialEntry;
  const prevEntry = entries[format(prevDate, 'yyyy-MM-dd')];
  const nextEntry = entries[format(nextDate, 'yyyy-MM-dd')];

  return (
    <div className="min-h-screen">
      {/* Add MemoryScene as background */}
      <MemoryScene imageUrl={currentEntry?.image_url} />

      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-20">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <button
            onClick={() => {
              const quarter = Math.floor(date.getMonth() / 3) + 1;
              router.push(`/maximizing/quarter/${quarter}`);
            }}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Q{Math.floor(date.getMonth() / 3) + 1}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Navigation Pills */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => !isTransitioning && navigateToDate(prevDate)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              ${prevEntry?.image_url ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}
              transition-colors
            `}
          >
            ← {format(prevDate, 'MMM d')}
            {prevEntry?.image_url && <span className="w-2 h-2 rounded-full bg-blue-400" />}
          </button>
          <button
            onClick={() => !isTransitioning && navigateToDate(nextDate)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              ${nextEntry?.image_url ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}
              transition-colors
            `}
          >
            {format(nextDate, 'MMM d')} →
            {nextEntry?.image_url && <span className="w-2 h-2 rounded-full bg-blue-400" />}
          </button>
        </div>

        {/* Current Day Card */}
        <motion.div
          className="w-full mb-8"
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
        >
          <DayCard 
            date={date} 
            entry={currentEntry} 
            isToday={format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')} 
            session={session}
          />
        </motion.div>

        {/* Additional Content */}
        <motion.div 
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto"
      style={{
        width: 'min(400px, 100%)',
        perspective: 1000
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Floating Animation Container */}
      <motion.div
        animate={{
          rotateX: mousePosition.y * 10,
          rotateY: mousePosition.x * 10,
          y: [0, 5, 0],
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 200, damping: 20 },
          rotateY: { type: "spring", stiffness: 200, damping: 20 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        {/* Polaroid Frame */}
        <motion.div 
          className="bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            aspectRatio: '54/86',
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Date Header */}
          <motion.div 
            className="absolute top-0 left-0 right-0 z-10 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <motion.div 
                className="text-3xl font-light tracking-wide text-white mix-blend-difference"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                {format(date, 'MMMM d')}
              </motion.div>
              <motion.div 
                className="text-sm text-white mix-blend-difference opacity-80"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                {format(date, 'yyyy')}
              </motion.div>
            </div>
          </motion.div>

          {/* Image or Empty State */}
          <div className="relative h-full w-full bg-gradient-to-b from-gray-50 to-gray-100">
            {entry?.image_url ? (
              <motion.div 
                className="relative w-full h-full"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={entry.image_url}
                  alt={`Memory from ${format(date, 'MMMM d, yyyy')}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  quality={100}
                  unoptimized
                />
                {/* Subtle Overlay for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
              </motion.div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center">
                {session && isToday ? (
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="inline-block p-4 rounded-full bg-blue-50/80 backdrop-blur-sm">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <span className="text-blue-500 text-lg">Add</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-block p-4 rounded-full bg-gray-100/80 backdrop-blur-sm">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">
                          {isToday ? "Add" : date > new Date() ? "Soon" : "Empty"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Shadow */}
        <div 
          className="absolute -inset-4 bg-black/10 -z-10 rounded-xl blur-xl opacity-50"
          style={{
            transform: `rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
} 