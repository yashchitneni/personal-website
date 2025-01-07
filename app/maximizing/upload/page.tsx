'use client';

import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/app/components/ImageUploader';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, parseISO } from 'date-fns';

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with current date at noon to avoid timezone issues
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleUploadComplete = async (url: string) => {
    setImageUrl(url);
    setIsRedirecting(true);
    
    // Use a Promise to handle the timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      router.push('/maximizing');
      router.refresh(); // Force a refresh of the page data
    } catch (error) {
      console.error('Redirect error:', error);
      // Fallback to window.location if router.push fails
      window.location.href = '/maximizing';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/maximizing')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Calendar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Upload Today's Memory</h1>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                // Create new date at noon to avoid timezone issues
                const date = parseISO(e.target.value);
                const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
                setSelectedDate(newDate);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div 
            className={`
              aspect-[1/1.2] w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4
              ${isDragActive ? 'ring-2 ring-blue-400' : ''}
            `}
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={() => setIsDragActive(false)}
          >
            {imageUrl ? (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center bg-green-50 rounded-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">Upload Complete!</div>
                    <div className="text-sm text-green-500">
                      {isRedirecting ? 'Redirecting to calendar...' : 'Processing...'}
                    </div>
                  </div>
                </div>
                <Image
                  src={imageUrl}
                  alt={`Image for ${format(selectedDate, 'MMMM do, yyyy')}`}
                  fill
                  className="object-cover rounded-sm"
                />
              </div>
            ) : (
              <ImageUploader 
                date={selectedDate}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Drag and drop your Polaroid image or click to select
          </div>
        </div>
      </div>
    </div>
  );
} 