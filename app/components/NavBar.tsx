'use client'

import Link from 'next/link'
import { useState } from 'react'

const menuItems = [
  { name: 'Newsletter', href: '/newsletter' },
  { name: 'Just Keep Building', href: '/building' },
  { name: 'DJing', href: '/djing' },
  { name: 'Yash', href: '/yash' },
]

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-purple-700 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            {/* Logo */}
            <div>
              <Link href="/" className="flex items-center py-5 px-2 text-white hover:text-gray-300">
                <span className="font-bold">My World</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} className="py-5 px-3 hover:text-gray-300">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="mobile-menu-button">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href} className="block py-2 px-4 text-sm hover:bg-purple-600">
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}