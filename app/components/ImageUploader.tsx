'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ImageUploaderProps {
  date: Date;
  onUploadComplete?: (imageUrl: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function ImageUploader({ date, onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Reset states
    setError(null);
    setIsUploading(true);

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      const normalizedDate = format(date, 'yyyy-MM-dd');

      // Check if an entry already exists for this date
      const { data: existingEntry, error: existingError } = await supabase
        .from('daily_entries')
        .select('image_url')
        .eq('user_id', session.user.id)
        .eq('date', normalizedDate)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing entry:', existingError);
        throw new Error('Error checking existing entry');
      }

      // If there's an existing entry, delete the old image
      if (existingEntry?.image_url) {
        const oldFileName = existingEntry.image_url.split('/').pop();
        if (oldFileName) {
          const { error: removeError } = await supabase.storage
            .from('daily-images')
            .remove([oldFileName]);
          
          if (removeError) {
            console.error('Error removing old image:', removeError);
          }
        }
      }

      // Generate a clean file name for storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${normalizedDate}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Upload file directly to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('daily-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error('Error uploading image: ' + uploadError.message);
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('daily-images')
        .getPublicUrl(fileName);

      // Create or update the daily entry in the database
      const { data: entryData, error: entryError } = await supabase
        .from('daily_entries')
        .upsert({
          date: normalizedDate,
          image_url: publicUrl,
          user_id: session.user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (entryError) {
        throw new Error('Error saving entry: ' + entryError.message);
      }

      onUploadComplete?.(publicUrl);
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
            <div className="text-sm text-gray-500">Click to upload image (max 50MB)</div>
            {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
} 