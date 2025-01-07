import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const runtime = 'edge';

/*
Required Supabase Setup:
1. Create a storage bucket named 'daily-images'
   - Go to Storage in Supabase dashboard
   - Click "New Bucket"
   - Name it "daily-images"
   - Make it private

2. Create a table named 'daily_entries'
   - Go to SQL editor
   - Run this SQL:
   CREATE TABLE daily_entries (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     date DATE NOT NULL,
     image_url TEXT,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     UNIQUE(user_id, date)
   );
*/

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const date = formData.get('date') as string;
    const timezone = formData.get('timezone') as string || 'UTC';

    if (!file || !date) {
      return NextResponse.json(
        { error: 'Image and date are required' },
        { status: 400 }
      );
    }

    // Convert the local date to UTC, considering the user's timezone
    const localDate = parseISO(date);
    const zonedDate = toZonedTime(localDate, timezone);
    const normalizedDate = format(zonedDate, 'yyyy-MM-dd');

    // Check if an entry already exists for this date
    const { data: existingEntry } = await supabase
      .from('daily_entries')
      .select('image_url')
      .eq('user_id', session.user.id)
      .eq('date', normalizedDate)
      .single();

    // If there's an existing entry, delete the old image
    if (existingEntry?.image_url) {
      const oldFileName = existingEntry.image_url.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('daily-images')
          .remove([oldFileName]);
      }
    }

    // Upload new image to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${date}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('daily-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Error uploading image' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('daily-images')
      .getPublicUrl(fileName);

    // Create or update the daily entry in the database
    const { data, error: entryError } = await supabase
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
        { error: 'Error saving entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 