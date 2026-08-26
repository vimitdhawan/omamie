import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY cannot be empty"),
});

const isProd = process.env.NODE_ENV === "production";

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  if (isProd) {
    throw new Error(
      "Invalid environment variables. Please check your production configuration."
    );
  }
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: parsed.success
    ? parsed.data.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://your-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: parsed.success
    ? parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "your-publishable-key-placeholder",
};

export type Env = typeof env;
