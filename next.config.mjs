/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://ndkpikxbmphykslsvslx.supabase.co",
      },
    ],
  },
};

export default nextConfig;
