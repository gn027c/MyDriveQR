const path = require('path');
const { config } = require('dotenv');

// Load .env from monorepo root
config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@qr-uploader/ui', '@qr-uploader/utils'],
  images: {
    domains: ['lh3.googleusercontent.com', 'drive.google.com'],
  },
  // Optimize for Vercel Free tier
  experimental: {
    serverActions: {
      bodySizeLimit: '10000mb', // Allow large file uploads up to 10GB
    },
  },
};

module.exports = nextConfig;
