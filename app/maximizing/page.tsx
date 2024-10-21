import Link from 'next/link';

export default function Maximizing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Maximizing</h1>
      <div className="flex space-x-4">
        <Link href="/maximizing/health" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Health
        </Link>
        <Link href="/maximizing/life" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Life
        </Link>
      </div>
    </div>
  );
}