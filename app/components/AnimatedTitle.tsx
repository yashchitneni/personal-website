'use client'

import { motion } from 'framer-motion'

export function AnimatedTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h1 
      className="text-4xl md:text-6xl font-bold text-white text-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.h1>
  )
}