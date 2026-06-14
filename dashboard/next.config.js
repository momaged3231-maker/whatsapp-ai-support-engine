/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // pg is a server-only dependency; keep it external to the client bundle.
  experimental: { serverComponentsExternalPackages: ['pg'] },
};
module.exports = nextConfig;
