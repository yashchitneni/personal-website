import React from 'react';
import { Metadata } from 'next';
import { Calendly } from '../components/Calendly';

export const metadata: Metadata = {
  title: 'Book an AI Session | Yash Chitneni',
  description: 'Schedule a one-on-one AI tutoring session with Yash Chitneni.',
};

export default function BookAISession() {
  return (
    <div className="container mx-auto px-4">
      <section className="py-16 md:py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl">Book an AI Session</h1>
        <p className="text-xl mb-8 max-w-2xl">Schedule a one-on-one AI tutoring session to accelerate your learning and understanding of artificial intelligence.</p>
      </section>
      
      <section className="mb-16">
        <Calendly />
      </section>
    </div>
  );
}
