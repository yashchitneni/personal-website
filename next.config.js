/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cyyhznnekmobusymaihy.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cyyhznnekmobusymaihy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
