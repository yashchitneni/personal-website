'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface ImageUploaderProps {
  date: Date;
  onUploadComplete?: (imageUrl: string) => void;
}

export function ImageUploader({ date, onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('date', format(date, 'yyyy-MM-dd'));

      const response = await fetch('/api/upload-daily-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      onUploadComplete?.(result.data.image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        {isUploading ? (
          <div className="text-sm text-gray-500">Uploading...</div>
        ) : (
          <>
            <div className="text-sm text-gray-500">Click to upload image</div>
            {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
} 