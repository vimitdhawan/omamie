import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Disable Turbopack to use webpack config for SVG imports
  turbopack: {
    resolveAlias: {
      // Required for @svgr/webpack to work
      "*.svg": ["@svgr/webpack", "file-loader"],
    },
  },
  // SVG import configuration
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
