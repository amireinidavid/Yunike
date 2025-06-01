import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com', // For default images from Unsplash
      'ik.imagekit.io',      // For ImageKit uploaded images
      'localhost'            // For local development
    ],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      }
    ]
  }
};

export default nextConfig;
