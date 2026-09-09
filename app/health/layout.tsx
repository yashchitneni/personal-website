import type { ReactNode } from 'react'
import { Fraunces } from 'next/font/google'

const display = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})

export default function HealthLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} min-h-screen bg-[#fbfaf8] text-stone-900 antialiased`}>{children}</div>
}
