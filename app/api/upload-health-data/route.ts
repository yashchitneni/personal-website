import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { insertBiofeedbackEntry } from '@/app/maximizing/health/upload/metrics';
import { format, toZonedTime } from 'date-fns-tz'; // You'll need to install this package

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Handles POST requests for uploading health data.
 * @async
 * @function POST
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 * @throws {Error} If there's an issue with authentication or data insertion.
 * @description This function authenticates the user, processes the incoming health data,
 * adjusts it for the user's timezone, and inserts it into the database.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  const { data: userData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !userData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Get the user's time zone from the request headers or use a default
    const userTimeZone = request.headers.get('X-User-Timezone') || 'America/Chicago'; // Default to Central Time

    // Get current date and time in the user's time zone
    const now = toZonedTime(new Date(), userTimeZone);
    const today = format(now, 'yyyy-MM-dd', { timeZone: userTimeZone });
    const time = format(now, 'HH:mm:ss', { timeZone: userTimeZone });

    // Prepare the biofeedback entry
    const biofeedbackData = {
      ...data,
      date: today,
      time: time,
    };

    // Insert biofeedback entry
    const result = await insertBiofeedbackEntry(biofeedbackData);

    if (!result) {
      throw new Error('Failed to insert biofeedback entry');
    }

    return NextResponse.json({ message: 'Data uploaded successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 });
  }
}