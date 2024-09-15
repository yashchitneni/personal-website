'use client'

import { useEffect, useState } from 'react';
import Button from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { AnimatedTitle } from '../../../components/AnimatedTitle';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/app/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { User } from '@supabase/auth-helpers-nextjs';

/**
 * UploadHealthData Component
 * @component
 * @description Renders a page for uploading health data. It includes authentication checks,
 * a text area for JSON input, and handles the upload process.
 * @returns {JSX.Element} The rendered UploadHealthData component.
 */
export default function UploadHealthData() {
  const [jsonData, setJsonData] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Fetches the current user data on component mount.
   * @function
   * @async
   */
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }
    getUser();
  }, [supabase.auth]);

  /**
   * Redirects unauthenticated users to the login page.
   * @function
   */
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // Adjust the path as needed
    }
  }, [user, isLoading, router]);

  /**
   * Handles the upload of health data.
   * @function
   * @async
   * @description Validates the input, sends the data to the server, and handles the response.
   */
  const handleUpload = async () => {
    if (!jsonData) {
      toast({
        title: 'No data entered',
        description: 'Please enter JSON data to upload.',
        variant: 'destructive',
      });
      return;
    }
  
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('No valid session');
      }
  
      const response = await fetch('/api/upload-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone, // Add this line
        },
        body: jsonData,
      });
  
      if (response.ok) {
        toast({
          title: 'Upload successful',
          description: 'Your health data has been uploaded.',
        });
        setJsonData('');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your health data.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedTitle>Upload Health Data</AnimatedTitle>
      {user ? (
        <>
          <div className="mb-6">
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your JSON data here"
              rows={10}
            />
          </div>
          <Button onClick={handleUpload}>Upload Personal Data</Button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Please sign in to upload health data.</p>
          {/* You can add a sign-in button here if needed */}
        </div>
      )}
    </div>
  );
}