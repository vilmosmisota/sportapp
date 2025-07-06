/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ndkpikxbmphykslsvslx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "sportwise.net",
      },
    ],
  },
};

export default nextConfig;
