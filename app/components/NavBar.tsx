'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false);
    router.push(href);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Yash Chitneni
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/maximizing" className="text-gray-600 hover:text-gray-900">
              Maximizing
            </Link>
            <Link href="/powered-by" className="text-gray-600 hover:text-gray-900">
              My OS
            </Link>
            <Link href="/dictating" className="text-gray-600 hover:text-gray-900">
              Dictating
            </Link>
            <Link href="/book-ai-session" className="text-gray-600 hover:text-gray-900">
              Book an AI Session
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div ref={menuRef} className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button onClick={() => handleLinkClick('/maximizing')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Maximizing
          </button>
          <button onClick={() => handleLinkClick('/powered-by')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            My OS
          </button>
          <button onClick={() => handleLinkClick('/dictating')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Dictating
          </button>
          <button onClick={() => handleLinkClick('/book-ai-session')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Book an AI Session
          </button>
        </div>
      </div>
    </nav>
  );
}
