import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker builds run standalone, keeping the production image small.
  output: "standalone",
};

export default nextConfig;
