import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { format, parseISO } from 'date-fns';

// Configure for Next.js 14 App Router
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes
export const preferredRegion = 'auto';

// Increase size limit
export async function POST(request: Request) {
  try {
    // Ensure we're getting a proper request
    if (!request.body) {
      return NextResponse.json(
        { error: 'No request body' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('image') as File;
      const date = formData.get('date') as string;

      if (!file || !date) {
        return NextResponse.json(
          { error: 'Image and date are required' },
          { status: 400 }
        );
      }

      // Validate file size (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size must be less than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
          { status: 400 }
        );
      }

      // Log request data for debugging
      console.log('Upload request:', {
        date,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Parse the date and set the time to noon UTC to avoid timezone issues
      const parsedDate = parseISO(date);
      const normalizedDate = format(parsedDate, 'yyyy-MM-dd');

      console.log('Date handling:', {
        inputDate: date,
        parsedDate: format(parsedDate, 'yyyy-MM-dd'),
        normalizedDate
      });

      // Check if an entry already exists for this date
      const { data: existingEntry, error: existingError } = await supabase
        .from('daily_entries')
        .select('image_url')
        .eq('user_id', session.user.id)
        .eq('date', normalizedDate)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing entry:', existingError);
        return NextResponse.json(
          { error: 'Error checking existing entry' },
          { status: 500 }
        );
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
      
      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('daily-images')
        .upload(fileName, fileData, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Error uploading image: ' + uploadError.message },
          { status: 500 }
        );
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
        console.error('Database error:', entryError);
        return NextResponse.json(
          { error: 'Error saving entry: ' + entryError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: entryData });
    } catch (formError) {
      console.error('Form processing error:', formError);
      return NextResponse.json(
        { error: 'Error processing form data: ' + (formError instanceof Error ? formError.message : String(formError)) },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 