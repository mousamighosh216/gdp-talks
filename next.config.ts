import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // mongoose is only used on the server; keep it out of the bundle
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
