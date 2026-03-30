'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Note {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
}

export default function NotingPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(setNotes);
  }, []);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));
  const filtered = activeTag ? notes.filter(n => n.tags.includes(activeTag)) : notes;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-[30vh] md:h-[40vh] bg-black bg-opacity-50 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
          Noting
        </h1>
      </div>
      <div className="max-w-4xl mx-auto my-8 px-4">
        <p className="text-gray-600 mb-6">Short notes, quick takes, and things worth writing down.</p>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-sm ${!activeTag ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm ${activeTag === tag ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {filtered.map(note => (
            <Link key={note.slug} href={`/noting/${note.slug}`} className="block">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(note.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h2>
                <p className="text-gray-600 mb-3">{note.description}</p>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
