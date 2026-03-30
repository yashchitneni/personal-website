import { NextResponse } from 'next/server';
import { getAllNotes } from '@/lib/notes';

export async function GET() {
  const notes = getAllNotes();
  return NextResponse.json(notes);
}
