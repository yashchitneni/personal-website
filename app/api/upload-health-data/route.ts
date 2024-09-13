import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { insertBiofeedbackEntry } from '@/app/quantifying/health/upload/metrics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  const { data: user, error: authError } = await supabase.auth.getUser(token);
  const userId = user?.user?.id; // Safely access user ID

  if (authError || !userId) {
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
      user_id: userId, // Use the safely accessed user ID
    };

    // Insert biofeedback entry with date and time
    const result = await insertBiofeedbackEntry(biofeedbackData, userId, today, time);

    if (!result) {
      throw new Error('Failed to insert biofeedback entry');
    }

    return NextResponse.json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading data:', error);
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 });
  }
}