import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // for Google profile images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // optional (GitHub)
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // optional (Cloudinary)
      },
    ],
  },
};

export default nextConfig;
