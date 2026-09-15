import type { NextConfig } from "next";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // getPublicImageUrl() runs in client components, where only NEXT_PUBLIC_* vars are inlined.
  // Deployments that set only SUPABASE_URL would otherwise build image URLs from an undefined
  // base and render nothing, so the fallback is resolved here at build time.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ?? "",
  },
  images: {
    // Property photos are served from the public `property-images` bucket.
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: new URL(supabaseUrl).protocol.replace(":", "") as
              "http" | "https",
            hostname: new URL(supabaseUrl).hostname,
            port: new URL(supabaseUrl).port || undefined,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
