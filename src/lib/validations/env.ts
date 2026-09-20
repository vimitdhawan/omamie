import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  // Read by getPublicImageUrl() in client components, where only NEXT_PUBLIC_ vars are
  // inlined. Optional so a deployment that has not set it still boots; it falls back to
  // SUPABASE_URL below, which is correct whenever the two point at the same project.
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .optional(),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "SUPABASE_PUBLISHABLE_KEY cannot be empty"),
  // Read by createClient() in the browser Supabase client, where only NEXT_PUBLIC_
  // vars are inlined. Optional so a deployment that has not set it still boots;
  // it falls back to SUPABASE_PUBLISHABLE_KEY below.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY cannot be empty")
    .optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty"),
});

const isProd = process.env.NODE_ENV === "production";

const parsed = envSchema.safeParse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  const errorMsg = `Invalid environment variables: ${parsed.error.toString()}`;

  if (isProd) {
    throw new Error(errorMsg);
  }

  console.error(
    `[ENV VALIDATION ERROR] ${errorMsg}. Using placeholder values, which will cause network errors on Supabase calls.`
  );
}

export const env = {
  SUPABASE_URL: parsed.success
    ? parsed.data.SUPABASE_URL
    : process.env.SUPABASE_URL || "https://your-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_URL:
    (parsed.success ? parsed.data.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://your-project.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: parsed.success
    ? parsed.data.SUPABASE_PUBLISHABLE_KEY
    : process.env.SUPABASE_PUBLISHABLE_KEY ||
      "your-publishable-key-placeholder",
  SUPABASE_SERVICE_ROLE_KEY: parsed.success
    ? parsed.data.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "your-service-role-key-placeholder",
};

export type Env = typeof env;
