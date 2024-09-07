import Image from 'next/image'

export default function YashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden mb-8">
          <Image
            src="/images/yash-banner.jpg"
            alt="Yash Banner"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-white text-center mb-8">About Yash</h1>
        <p className="text-white text-center">
          This is a placeholder for the Yash page. Add your personal information or content here.
        </p>
      </div>
    </div>
  )
}