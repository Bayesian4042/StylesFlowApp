/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['v3.fal.media'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
