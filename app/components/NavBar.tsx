import Link from 'next/link';

export function NavBar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Yash Chitneni
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/maximizing" className="text-gray-600 hover:text-gray-900">
              Maximizing
            </Link>
          <Link href="/dictating" className="text-gray-600 hover:text-gray-900">
              Dictating
            </Link>
            <Link href="/book-ai-session" className="text-gray-600 hover:text-gray-900">Book an AI Session</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
