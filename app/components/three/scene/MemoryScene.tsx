'use client';

import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

interface MemorySceneProps {
  imageUrl?: string | null;
}

export function MemoryScene({ imageUrl }: MemorySceneProps) {
  return (
    <div className="absolute inset-0 -z-10">
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
          opacity: 0.95
        }}
      />
      <div 
        className="absolute inset-0 bg-white/50 backdrop-blur-3xl"
        style={{
          maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)'
        }}
      />
    </div>
  );
} 