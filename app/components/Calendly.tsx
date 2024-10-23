'use client';

import React, { useEffect } from 'react';

export function Calendly() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      className="calendly-inline-widget" 
      data-url="https://calendly.com/yash-chitneni/ai-tutoring" 
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
}
