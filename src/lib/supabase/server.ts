import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/validations/env";
import { type Database } from "./types";

/**
 * Server-side Supabase client for Server Components and Server Actions.
 * Uses the cookie store from Next.js headers.
 *
 * Usage:
 * ```typescript
 * const supabase = await createClient();
 * const { data } = await supabase.from('users').select();
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently handle cookie write errors
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client that bypasses RLS.
 * Server-only — never import this in client components or expose the key.
 * Use for tables (e.g. contact_messages) whose RLS policy only grants
 * access to the `service_role`.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Proxy-specific Supabase client for middleware/proxy layer.
 * Uses NextRequest and NextResponse for cookie management.
 *
 * Usage:
 * ```typescript
 * const supabase = createMiddlewareClient(request, response);
 * const { data } = await supabase.auth.getUser();
 * ```
 *
 * @param request - NextRequest from proxy function
 * @param response - NextResponse to set cookies on
 * @returns Supabase client configured for middleware
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}
