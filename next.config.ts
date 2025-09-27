import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 使用者頭像
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Google Cloud Storage
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imagefaker.access.mx.com', // Fake Image
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
