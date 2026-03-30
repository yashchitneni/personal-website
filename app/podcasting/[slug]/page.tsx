import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { podcasts } from '../data'

export async function generateStaticParams() {
  return podcasts.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = podcasts.find(x => x.slug === params.slug)
  return {
    title: p ? `${p.title} — Podcasts` : 'Podcast',
    description: p?.short ?? p?.description,
    openGraph: p
      ? {
          title: `${p.title} — Podcasts`,
          description: p.short ?? p.description,
        }
      : undefined,
  }
}

export default function PodcastDetail({ params }: { params: { slug: string } }) {
  const p = podcasts.find(x => x.slug === params.slug)
  if (!p) return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Podcast not found</h1>
      <Link href="/podcasts" className="mt-4 inline-flex rounded-md border px-3 py-1.5 text-sm">Back</Link>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <Link href="/podcasts" className="inline-flex items-center text-sm text-gray-600 hover:underline">← Back to Podcasts</Link>
      <header className="mt-4 mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{p.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{p.role}</p>
      </header>

      {p.imageSrc && (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <Image src={p.imageSrc} alt={p.title} fill className="object-cover" />
        </div>
      )}

      <section className="mt-6 space-y-6">
        {p.tier === 'million-plus' && (
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs">Over 1,000,000 listens</div>
        )}
        {p.tier === 'hundredk-plus' && (
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs">0 → 100,000+ listens</div>
        )}

        <p className="text-base text-gray-700 whitespace-pre-line">{p.description}</p>

        {p.highlights && p.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.highlights.map(h => (
              <span key={h} className="text-xs rounded-full border px-2 py-1 text-gray-600">{h}</span>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">Listen</h2>
          <div className="flex flex-wrap gap-2">
            {p.links?.apple && <Link href={p.links.apple} target="_blank" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Apple</Link>}
            {p.links?.spotify && <Link href={p.links.spotify} target="_blank" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Spotify</Link>}
            {p.links?.youtube && <Link href={p.links.youtube} target="_blank" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">YouTube</Link>}
            {p.links?.rss && <Link href={p.links.rss} target="_blank" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">RSS</Link>}
            {p.links?.site && <Link href={p.links.site} target="_blank" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Site</Link>}
          </div>
        </div>

        <div className="pt-4 text-sm text-gray-500">
          <p>
            This case study summarizes how I engineered automations, course platforms, and internal website tooling to turn
            conversations into distribution, community, and revenue.
          </p>
        </div>
      </section>
    </div>
  )
}

