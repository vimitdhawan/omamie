import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "SUPABASE_PUBLISHABLE_KEY cannot be empty"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty"),
});

const isProd = process.env.NODE_ENV === "production";

const parsed = envSchema.safeParse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  if (isProd) {
    throw new Error(
      "Invalid environment variables. Please check your production configuration."
    );
  }
}

export const env = {
  SUPABASE_URL: parsed.success
    ? parsed.data.SUPABASE_URL
    : process.env.SUPABASE_URL || "https://your-project.supabase.co",
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
