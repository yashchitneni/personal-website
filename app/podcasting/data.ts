export type PodcastItem = {
  slug: string
  title: string
  role: string
  status: 'monetized' | 'needs-listens'
  description: string
  short?: string // concise, 1–2 line summary for cards
  highlights?: string[] // key capabilities to show as chips
  tier?: 'million-plus' | 'hundredk-plus' | 'studio'
  imageSrc?: string
  links?: {
    apple?: string
    spotify?: string
    youtube?: string
    rss?: string
    site?: string
  }
}

// Current items — populated from user-provided details. Add more entries below.
export const podcasts: PodcastItem[] = [
  {
    slug: 'align-podcast',
    title: 'Align Podcast',
    role: 'Growth, Producer',
    imageSrc: '/podcasts/align-podcast.jpg',
    status: 'monetized',
    tier: 'million-plus',
    description:
      "Built the automation for the content pipeline (YouTube → community) and the course platform/pipelines — wiring distribution to monetization funnels and owning internal website tooling.",
    short:
      "Automations for content → community, course platform pipelines, and distribution-to-revenue tooling.",
    highlights: ['Automations', 'Course Platform', 'Distribution', 'Community'],
    // Optional image: add artwork to public/podcasts/align.png and set imageSrc: '/podcasts/align.png'
    links: {
      apple: 'https://plinkhq.com/i/988576741?to=applepod',
      spotify: 'https://open.spotify.com/show/2MhCZyUIf8jdYGpbSWzTEu',
      youtube: 'https://www.youtube.com/@AlignPodcast',
      site: 'https://www.alignpodcast.com/episodes'
    }
  },
  {
    slug: 'wellpower-podcast',
    title: 'Wellpower Podcast',
    role: 'Growth, Producer',
    imageSrc: '/podcasts/wellpower-podcast.webp',
    status: 'monetized',
    tier: 'million-plus',
    description:
      "Built the course platform/pipelines and distribution-to-monetization funnel; responsible for internal website tooling alongside growth and production.",
    short:
      "Course platform + pipeline buildout with automated distribution and site tooling for growth.",
    highlights: ['Course Platform', 'Distribution', 'Internal Tooling'],
    // Optional image: add artwork to public/podcasts/wellpower.png and set imageSrc: '/podcasts/wellpower.png'
    links: {
      apple: 'https://podcasts.apple.com/us/podcast/wellpower/id1514537566',
      spotify: 'https://open.spotify.com/show/7EKXTOqgKIXe6kmlwkJvts?si=b8a06ad41ead4d94',
      youtube: 'https://www.youtube.com/@WellpowerLife',
      site: 'https://www.wellpower.life/wellpower-podcast'
    }
  },
  {
    slug: 'thrive-on-life-podcast',
    title: 'Thrive On Life Podcast',
    role: 'Growth, Producer',
    imageSrc: '/podcasts/thrive-onlife.jpeg',
    status: 'monetized',
    tier: 'hundredk-plus',
    description:
      "Built the automation for the content pipeline (YouTube → community) and the course platform/pipelines — wiring distribution to monetization funnels and owning internal website tooling.",
    short:
      "Automations for content → community, course platform pipelines, and distribution-to-revenue tooling.",
    highlights: ['Automations', 'Course Platform', 'Distribution', 'Community'],
    links: {
      apple: 'https://podcasts.apple.com/us/podcast/thriveonlife-podcast-helping-people-live-better-lives/id1458535319',
      spotify: 'https://open.spotify.com/show/4wC1XXAIary333lGYZ43CH',
      youtube: 'https://www.youtube.com/playlist?list=PLTHZfhqByqq9p0pGO2MUYC-ZA0xUckj5W',
      site: 'https://thriveonlife.com/#1'
    }
  },
  {
    slug: 'conversations-with-claire',
    title: 'Conversations with Claire',
    role: 'Growth, Producer',
    imageSrc: '/podcasts/conversations with claire.jpeg',
    status: 'monetized',
    tier: 'hundredk-plus',
    description:
      "Built the automation for the content pipeline (YouTube → community) and the course platform/pipelines — wiring distribution to monetization funnels and owning internal website tooling.",
    short:
      "Automations for content → community, course platform pipelines, and distribution-to-revenue tooling.",
    highlights: ['Automations', 'Course Platform', 'Distribution', 'Community'],
    links: {
      apple: 'https://podcasts.apple.com/us/podcast/conversations-with-claire/id1641398388?ls=1',
      spotify: 'https://open.spotify.com/show/67cDKzQ9DIzwCkQrfsWwI7',
      youtube: 'https://www.youtube.com/@clairebayscoach'
    }
  },
  {
    slug: 'danny-miranda-podcast',
    title: 'The Danny Miranda Podcast',
    role: 'Studio, Pipeline Support',
    imageSrc: '/podcasts/danny-miranda.jpeg',
    status: 'monetized',
    tier: 'studio',
    description:
      "Built the automation for the content pipeline and distribution stack that enabled a sustainable 3-episodes-per-week cadence in summer 2023; integrated tooling across platforms to scale output.",
    short:
      "Automation-enabled 3x/week cadence (summer ’23) with a distribution stack to scale output.",
    highlights: ['Automations', 'Distribution', 'Cadence 3x/week'],
    links: {
      apple: 'https://podcasts.apple.com/us/podcast/the-danny-miranda-podcast/id1532160275',
      spotify: 'https://open.spotify.com/show/6zteH1pAiF07ArhYYNhSfb',
      youtube: 'https://www.youtube.com/c/DannyMiranda'
    }
  },
  {
    slug: 'meat-mafia-podcast',
    title: 'Meat Mafia Podcast',
    role: 'Growth, Producer',
    imageSrc: '/podcasts/meat-mafia.jpg',
    status: 'monetized',
    tier: 'million-plus',
    description:
      "Built the content pipeline and newsletter integration — routing podcast/video assets into a hyper-focused Health newsletter to drive retention and monetization.",
    short:
      "Pipeline → Health newsletter integration to convert distribution into retention and revenue.",
    highlights: ['Pipeline', 'Newsletter', 'Distribution'],
    links: {
      apple: 'https://podcasts.apple.com/ro/podcast/the-meat-mafia-podcast/id1627572601',
      spotify: 'https://open.spotify.com/show/69nxqKKmOc0Pi5zwVakoH9',
      youtube: 'https://www.youtube.com/@meatmafiamedia/videos'
    }
  },
  {
    slug: 'hannah-frankman-podcast',
    title: 'Hannah Frankman Podcast',
    role: 'Studio, Pipeline Support',
    imageSrc: '/podcasts/hannah-frankman.jpg',
    status: 'monetized',
    tier: 'studio',
    description:
      "Recorded in my automated studio; leveraged the platform for distribution-ready assets.",
    short:
      "Recorded in my automated studio; distribution-ready content.",
    highlights: ['Studio'],
    links: {}
  },
  {
    slug: 'paul-millerd-podcast',
    title: 'Paul Millerd Podcast',
    role: 'Studio, Pipeline Support',
    imageSrc: '/podcasts/pathless-path.webp',
    status: 'monetized',
    tier: 'studio',
    description:
      "Recorded in my automated studio; leveraged the platform for distribution-ready assets.",
    short:
      "Recorded in my automated studio; distribution-ready content.",
    highlights: ['Studio'],
    links: {}
  }
]

