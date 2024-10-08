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
          <div className="flex items-center">
            <Link href="/quantifying" className="text-gray-600 hover:text-gray-900">
              Quantifying
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}