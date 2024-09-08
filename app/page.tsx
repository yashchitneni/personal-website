'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const roles = [
  "startup founder",
  "programmer",
  "designer",
  "copywriter",
  "product manager",
  // ... add more roles as needed
]

export default function Home() {
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prevIndex) => (prevIndex + 1) % roles.length)
    }, 3000) // Change role every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Hey, I'm <span className="text-blue-600">Yash</span>
        </h1>
        <div className="flex items-center justify-center text-2xl mt-4">
          <span className="mr-2">I am a</span>
          <div className="relative">
            <div className="absolute -inset-1 bg-orange-300 rounded-lg transform rotate-2"></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={roleIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white px-4 py-2 rounded-lg shadow-sm transform -rotate-2"
              >
                {roles[roleIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}