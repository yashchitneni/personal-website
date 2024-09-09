import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={`bg-white shadow-md rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}