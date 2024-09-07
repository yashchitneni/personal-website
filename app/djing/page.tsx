import Image from 'next/image'

export default function DJingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden mb-8">
          <Image
            src="/images/djing-banner.jpg"
            alt="DJing Banner"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-white text-center mb-8">My DJing Journey</h1>
        {/* Add more content about your DJing here */}
      </div>
    </div>
  )
}