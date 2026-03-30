import { getNoteBySlug, getAllNoteSlugs } from '@/lib/notes';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getAllNoteSlugs().map(slug => ({ slug }));
}

export default async function NotePage({ params }: { params: { slug: string } }) {
  let note;
  try {
    note = await getNoteBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link href="/noting" className="text-gray-500 hover:text-gray-800 mb-8 inline-block">
          ← Back to notes
        </Link>
        <article className="bg-white rounded-lg p-8 shadow-sm">
          <div className="text-sm text-gray-500 mb-2">
            {new Date(note.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{note.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </article>
      </div>
    </div>
  );
}
