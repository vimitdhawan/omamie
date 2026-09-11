import { NextResponse, type NextRequest } from "next/server";
import { getRoleBasedRedirectPath } from "@/lib/auth-session";
import { createMiddlewareClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

const ROUTE_CONFIG = {
  public: ["/", "/contact", "/about", "/help", "/privacy", "/terms"],
  auth: ["/login", "/signup"],
  protected: [
    {
      pattern: "/properties/create/*",
      roles: ["agent", "owner"] as const,
    },
    {
      pattern: "/find-property/*",
      roles: ["tenant"] as const,
    },
  ],
} as const;

const authRoutes = ROUTE_CONFIG.auth;
const publicRoutes = ROUTE_CONFIG.public;
const PROTECTED_ROUTES = ROUTE_CONFIG.protected;

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    matchPattern(pathname, route.pattern)
  );
}

function getAllowedRolesForRoute(
  pathname: string
): readonly (typeof PROTECTED_ROUTES)[number]["roles"][number][] {
  const route = PROTECTED_ROUTES.find((r) => matchPattern(pathname, r.pattern));
  return route?.roles || [];
}

function matchPattern(pathname: string, pattern: string): boolean {
  // Step 1: Escape all regex special characters to prevent injection
  let regexStr = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Step 2: Un-escape forward slashes since we use them as delimiters
  regexStr = regexStr.replace(/\\\//g, "/");

  // Step 3: Handle Next.js wildcard syntax (/:path* → match anything after /)
  regexStr = regexStr.replace(/\/:path\\\*$/, "(?:/.*)?");

  // Step 4: Handle route parameters like :id → [^/]+
  regexStr = regexStr.replace(/:([^/]+)/g, "[^/]+");

  // Step 5: Escape forward slashes for regex
  regexStr = regexStr.replace(/\//g, "\\/");

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(pathname);
}

function isPublicRoutePath(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAuthRoutePath(pathname: string): boolean {
  return authRoutes.some((route) => pathname === route);
}

/**
 * Next.js Proxy Function
 *
 * HOW NEXT.JS RECOGNIZES THIS:
 * - Named export `proxy` function (required)
 * - Accepts `NextRequest` parameter
 * - Returns `NextResponse` (or Promise<NextResponse>)
 * - Located at `src/proxy.ts` (root level)
 * - `config` export with `matcher` array
 *
 * EXECUTION ORDER (Per Route):
 * 1. Static files (.css, .js, etc.) → Served directly (bypass proxy)
 * 2. URL matches `config.matcher` → proxy() function runs
 * 3. Request/response modified → Route handler receives updated request
 * 4. Route handler processes → Response returned
 *
 * PERFORMANCE:
 * - Runs at edge (when deployed to Vercel Edge Runtime)
 * - ~1-2ms overhead vs no proxy
 * - Faster than traditional middleware
 *
 * SEE: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export async function proxy(request: NextRequest) {
  return authMiddleware(request);
}

function getAuthSessionFromRequest(
  request: NextRequest
): { profileId: string; role: UserRole } | null {
  const sessionCookie = request.cookies.get("auth_session")?.value;
  if (!sessionCookie) return null;

  try {
    const parsed = JSON.parse(sessionCookie);
    if (parsed.profileId && parsed.role) {
      return parsed as { profileId: string; role: UserRole };
    }
    return null;
  } catch {
    return null;
  }
}

async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  if (pathname === "/") {
    const session = getAuthSessionFromRequest(request);
    if (session?.role) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleBasedRedirectPath(session.role);
      return NextResponse.redirect(url);
    }
  }

  if (isPublicRoutePath(pathname)) {
    return response;
  }

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isAuthRoutePath(pathname)) {
    return response;
  }

  if (!user) {
    return redirectToLogin(request);
  }

  const session = getAuthSessionFromRequest(request);

  if (!session?.role) {
    await supabase.auth.signOut({ scope: "local" });
    response.cookies.delete("auth_session");
    return redirectToLogin(request);
  }

  if (isAuthRoutePath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = getRoleBasedRedirectPath(session.role);
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute(pathname)) {
    const allowedRoles = getAllowedRolesForRoute(pathname);
    if (!allowedRoles.includes(session.role)) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleBasedRedirectPath(session.role);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

/**
 * Proxy Matcher Configuration
 *
 * Routes TO INTERCEPT (pass through proxy):
 * - All pages (/, /login, /dashboard, etc.)
 * - All API routes (/api/*)
 *
 * Routes TO SKIP (bypass proxy):
 * - _next/* → Next.js internals and static builds
 * - favicon.ico, robots.txt → Static metadata files
 * - *.svg, *.png, *.jpg, etc. → Image files
 * - *.woff, *.woff2 → Font files
 *
 * PATTERN: Negative lookahead excludes, so everything else is matched
 */
export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
