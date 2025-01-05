'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/app/components/ImageUploader';

interface DayImageUploaderProps {
  date: Date;
}

export function DayImageUploader({ date }: DayImageUploaderProps) {
  const router = useRouter();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleUploadComplete = (url: string) => {
    setTimeout(() => {
      router.refresh();
    }, 1000);
  };

  return (
    <div 
      className="relative aspect-[1/1.2] w-full"
      onDragEnter={() => setIsDragActive(true)}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={() => setIsDragActive(false)}
    >
      <ImageUploader 
        date={date}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
} 