import type { NextConfig } from 'next'

const config: NextConfig = {
  // /api/* → Backend (löst CORS + Cookie-Domain-Probleme in Dev und Prod)
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

export default config
