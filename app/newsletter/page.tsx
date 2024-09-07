import Image from 'next/image'
import Script from 'next/script'

export default function NewsletterPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden mb-8">
        <Image
          src="/images/newsletter-banner.jpg"
          alt="Newsletter Banner"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      <h1 className="text-4xl font-bold text-white text-center mb-8">Subscribe to My Newsletter</h1>
      
      {/* Beehiiv embed */}
      <div className="mb-8">
        <iframe 
          src="https://embeds.beehiiv.com/12d8784f-85eb-4f7a-bcfe-7fd8f571801b" 
          data-test-id="beehiiv-embed" 
          width="100%" 
          height="320" 
          frameBorder="0" 
          scrolling="no" 
          style={{
            borderRadius: '4px',
            border: '2px solid #e5e7eb',
            margin: 0,
            backgroundColor: 'transparent'
          }}
        />
      </div>

      {/* Beehiiv attribution script */}
      <Script 
        src="https://embeds.beehiiv.com/attribution.js" 
        strategy="afterInteractive"
      />
    </div>
  )
}