'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Replace 'YOUR_BEEHIIV_PUBLICATION_ID' with your actual Beehiiv publication ID
      const response = await fetch(`https://api.beehiiv.com/v2/publications/YOUR_BEEHIIV_PUBLICATION_ID/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Replace 'YOUR_BEEHIIV_API_KEY' with your actual Beehiiv API key
          'Authorization': 'Bearer YOUR_BEEHIIV_API_KEY'
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: false,
          send_welcome_email: true
        })
      })

      if (response.ok) {
        setMessage('Thank you for subscribing!')
        setEmail('')
      } else {
        setMessage('An error occurred. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex items-center border-b border-white py-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-shrink-0 bg-white hover:bg-gray-200 text-purple-700 font-bold py-2 px-4 rounded"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {message && (
        <p className="mt-2 text-white text-center">{message}</p>
      )}
    </form>
  )
}