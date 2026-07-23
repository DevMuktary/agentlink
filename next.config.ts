import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  
  images: {
    unoptimized: true, // CRITICAL: Stops Next.js from using sharp/squoosh to optimize images on the fly (Saves massive RAM)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', 
      },
    ],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // CRITICAL: Next.js uses huge amounts of RAM during Railway deployments to check types/lint. 
  // Disable them during the build (you already check them locally in VS Code).
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
