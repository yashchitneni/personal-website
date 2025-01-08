/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cyyhznnekmobusymaihy.supabase.co',
      'qzgzfhljoonwwdsiobxu.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cyyhznnekmobusymaihy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'qzgzfhljoonwwdsiobxu.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
