import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { podcasts } from './data'

export const metadata: Metadata = {
  title: 'Podcasts — Yash Chitneni',
  description: 'A simple showcase of podcasts I have launched, helped grow, or am currently building.',
}

export default function PodcastsPage() {
  const millionPlus = podcasts.filter((p) => p.tier === 'million-plus')
  const hundredKPlus = podcasts.filter((p) => p.tier === 'hundredk-plus')
  const studio = podcasts.filter((p) => p.tier === 'studio')
  const monetized = podcasts.filter((p) => p.status === 'monetized' && !p.tier)
  const needsListens = podcasts.filter((p) => p.status === 'needs-listens')

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Podcasts</h1>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          I built and sold Austin's first fully automated podcast studio to{' '}
          <Link href="https://modernstoa.co/" target="_blank" className="text-foreground underline hover:text-primary transition-colors">
            Modern Stoa
          </Link>
          , enabling creators to focus on content while the system handled everything else. My process: hands-free capture pipeline, automated editing and versioning, multi-platform distribution (YouTube, audio platforms, community), and direct integration with course platforms and brand funnels. I also engineered the internal website tooling that powered these systems end-to-end.
        </p>
      </header>

      {millionPlus.length > 0 && (
        <section className="mb-10 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Over 1,000,000 Listens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {millionPlus.map((p) => (
              <PodcastCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      )}

      {hundredKPlus.length > 0 && (
        <section className="mb-10 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">From 0 → 100,000+ Listens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hundredKPlus.map((p) => (
              <PodcastCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      )}

      {studio.length > 0 && (
        <section className="mb-10 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-1">Recorded In My Automated Studio</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-3xl">
            I provided the automated capture→edit→distribution pipeline so these teams could publish faster and at higher
            cadence. I wasn't embedded on their teams; the studio and pipeline acted as accelerators.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studio.map((p) => (
              <PodcastCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      )}

      {monetized.length > 0 && (
        <section className="mb-10 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Monetized</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {monetized.map((p) => (
              <PodcastCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      )}

      {needsListens.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Needs Listens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {needsListens.map((p) => (
              <PodcastCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PodcastCard({
  title,
  description,
  short,
  highlights,
  imageSrc,
  links,
  role,
  slug,
}: {
  title: string
  description: string
  short?: string
  highlights?: string[]
  imageSrc?: string
  links?: { apple?: string; spotify?: string; youtube?: string; rss?: string; site?: string }
  role: string
  slug: string
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {imageSrc ? (
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">{role}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{short ?? description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {highlights &&
            highlights.length > 0 &&
            highlights.slice(0, 3).map((h) => (
              <span key={h} className="text-xs rounded-full border px-2 py-1 text-gray-600">
                {h}
              </span>
            ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {links?.apple && (
            <Link href={links.apple} target="_blank" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              Apple
            </Link>
          )}
          {links?.spotify && (
            <Link href={links.spotify} target="_blank" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              Spotify
            </Link>
          )}
          {links?.youtube && (
            <Link href={links.youtube} target="_blank" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              YouTube
            </Link>
          )}
          {links?.rss && (
            <Link href={links.rss} target="_blank" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              RSS
            </Link>
          )}
          {links?.site && (
            <Link href={links.site} target="_blank" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              Site
            </Link>
          )}
          {!links?.apple &&
            !links?.spotify &&
            !links?.youtube &&
            !links?.rss &&
            !links?.site && <span className="text-xs text-gray-500">Links coming soon</span>}
          <span className="ml-auto" />
          <Link href={`/podcasts/${slug}`} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  )
}
