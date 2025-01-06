'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface QuarterViewProps {
  year: number;
  quarterIndex: number;
  entries?: {
    date: string;
    image_url: string | null;
  }[];
}

const quarters = [
  { label: 'Q1', months: ['January', 'February', 'March'] },
  { label: 'Q2', months: ['April', 'May', 'June'] },
  { label: 'Q3', months: ['July', 'August', 'September'] },
  { label: 'Q4', months: ['October', 'November', 'December'] }
];

const onboardingSteps = [
  {
    target: 'month-nav',
    title: 'Navigate Through Time',
    description: 'Switch between months to explore your memories. The blue dots show where memories are waiting.',
    position: 'bottom'
  },
  {
    target: 'memory-grid',
    title: 'Your Memory Collection',
    description: 'Each card represents a captured moment. Tap or click to dive into the full memory.',
    position: 'top'
  },
  {
    target: 'memory-card',
    title: 'Memory Details',
    description: 'Interact with any memory to see the full-size photo and details from that day.',
    position: 'right'
  }
];

export function QuarterView({ year, quarterIndex, entries = [] }: QuarterViewProps) {
  const router = useRouter();
  const quarter = quarters[quarterIndex];
  const [selectedMonth, setSelectedMonth] = useState<number>(quarterIndex * 3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const handleBack = () => {
    router.push('/maximizing');
  };

  const navigateToDay = (monthName: string, day: number) => {
    router.push(`/maximizing/${monthName.toLowerCase()}/${day}`);
  };

  const getMonthMemories = (monthIndex: number) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === monthIndex && entry.image_url;
    });
  };

  const handleMonthChange = (monthIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedMonth(monthIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const nextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/50 backdrop-blur transition-all"
          >
            ← Back to Year
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            {quarter.label} {year}
          </h1>
        </motion.div>

        {/* Month Navigation */}
        <div className="relative flex flex-col items-center mb-12" id="month-nav">
          <div className="inline-flex gap-2 p-1 bg-white/50 backdrop-blur rounded-xl">
            {quarter.months.map((monthName, offset) => {
              const monthIndex = quarterIndex * 3 + offset;
              const memories = getMonthMemories(monthIndex);
              
              return (
                <button
                  key={monthName}
                  onClick={() => handleMonthChange(monthIndex)}
                  className={`
                    relative px-6 py-3 rounded-lg transition-all duration-300
                    ${selectedMonth === monthIndex ? 'bg-white shadow-md' : 'hover:bg-white/50'}
                  `}
                >
                  <span className="relative z-10 font-medium">{monthName}</span>
                  {memories.length > 0 && (
                    <div className="absolute top-2 right-2 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="ml-1 text-xs text-gray-500">{memories.length}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="relative"
            id="memory-grid"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMonthMemories(selectedMonth).map((memory, index) => {
                const date = new Date(memory.date);
                const day = date.getDate();
                
                return (
                  <motion.div
                    key={memory.date}
                    layoutId={memory.date}
                    id={index === 0 ? 'memory-card' : undefined}
                    className="group relative aspect-square cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigateToDay(quarter.months[selectedMonth % 3], day)}
                  >
                    {/* Memory Card */}
                    <div className="absolute inset-0 bg-white rounded-lg shadow-md overflow-hidden">
                      {memory.image_url && (
                        <Image
                          src={memory.image_url}
                          alt={`Memory from ${format(date, 'MMMM d, yyyy')}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-lg font-light flex items-center justify-between">
                          <span>{format(date, 'MMMM d')}</span>
                          <span className="text-sm opacity-75">View Details →</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {getMonthMemories(selectedMonth).length === 0 && (
              <motion.div 
                className="bg-white/50 backdrop-blur-sm rounded-xl p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-gray-500 text-lg">No memories captured in {quarter.months[selectedMonth % 3]}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Onboarding Overlay */}
        <AnimatePresence>
          {showOnboarding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={skipOnboarding}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute max-w-md bg-white rounded-xl shadow-xl p-6"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="text-2xl font-bold mb-2">{onboardingSteps[onboardingStep].title}</div>
                <p className="text-gray-600 mb-6">{onboardingSteps[onboardingStep].description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {onboardingSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === onboardingStep ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={skipOnboarding}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Skip
                    </button>
                    <button
                      onClick={nextOnboardingStep}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {onboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 