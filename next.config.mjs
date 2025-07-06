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
        hostname: "pub-1d033076402741d08db8c16cbd780fb8.r2.dev",
      },
    ],
  },
};

export default nextConfig;
