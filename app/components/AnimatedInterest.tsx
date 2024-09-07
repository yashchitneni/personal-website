'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface InterestProps {
  name: string
  image: string
  link: string
  index: number
}

export function AnimatedInterest({ name, image, link, index }: InterestProps) {
  return (
    <Link href={link}>
      <motion.div 
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Image
          src={image}
          alt={name}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h2 className="text-white text-lg md:text-xl font-bold text-center px-2">{name}</h2>
        </div>
      </motion.div>
    </Link>
  )
}