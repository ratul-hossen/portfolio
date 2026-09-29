import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos uploaded from the admin panel live on Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
