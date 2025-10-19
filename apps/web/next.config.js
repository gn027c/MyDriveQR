/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  transpilePackages: ['@qr-uploader/ui', '@qr-uploader/utils'],
  images: {
    domains: ['lh3.googleusercontent.com', 'drive.google.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10000mb', // Allow large file uploads up to 10GB
    },
  },
};

module.exports = nextConfig;
