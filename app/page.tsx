import Image from 'next/image'
import { AnimatedTitle } from './components/AnimatedTitle'
import { AnimatedInterest } from './components/AnimatedInterest'

const interests = [
  { name: 'Health', image: '/images/health.jpg', link: '/health' },
  { name: 'Coding', image: '/images/coding.jpg', link: '/coding' },
  { name: 'DJing', image: '/images/djing.jpg', link: '/music' },
  // Add more interests as needed
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <AnimatedTitle>Welcome to My World</AnimatedTitle>
        
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 mb-8">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0">
            <Image
              src="/images/profile.jpg"
              alt="Profile Picture"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
            {interests.map((interest, index) => (
              <AnimatedInterest
                key={interest.name}
                name={interest.name}
                image={interest.image}
                link={interest.link}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}