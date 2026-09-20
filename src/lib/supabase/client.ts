import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "./types";

/**
 * Browser-side Supabase client for Client Components.
 * Reads the publishable key/url from NEXT_PUBLIC_ env vars inlined at build time.
 *
 * Usage:
 * ```typescript
 * const supabase = createClient();
 * await supabase.auth.signInWithOAuth({ provider: "google" });
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
