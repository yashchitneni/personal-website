import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { insertBiofeedbackEntry } from '@/app/quantifying/health/upload/metrics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('Token:', token); // Log the token

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  console.log('User Data:', userData); // Log user data

  if (authError || !userData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Get current date and time
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Prepare the biofeedback entry
    const biofeedbackData = {
      ...data,
      date: today, // Add current date
      time: time,   // Add current time
    };

    // Log the data being inserted
    console.log('Inserting data:', biofeedbackData);

    // Insert biofeedback entry
    const result = await insertBiofeedbackEntry(biofeedbackData);

    if (!result) {
      throw new Error('Failed to insert biofeedback entry');
    }

    return NextResponse.json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading data:', error);
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 });
  }
}