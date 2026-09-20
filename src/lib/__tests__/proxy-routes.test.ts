import { describe, it, expect, vi } from "vitest";
// proxy.ts pulls in the server-only Supabase client, which cannot be imported under jsdom.
vi.mock("@/lib/supabase/server", () => ({ createMiddlewareClient: vi.fn() }));

import {
  matchPattern,
  isProtectedRoute,
  getAllowedRolesForRoute,
} from "@/proxy";

describe("matchPattern", () => {
  it("matches the base path of a trailing wildcard", () => {
    // Regression: this returned false, so every role gate was dead.
    expect(matchPattern("/properties", "/properties/*")).toBe(true);
  });

  it("matches nested paths under a trailing wildcard", () => {
    expect(matchPattern("/properties/create", "/properties/*")).toBe(true);
    expect(matchPattern("/properties/abc/edit", "/properties/*")).toBe(true);
  });

  it("does not match a different prefix", () => {
    expect(matchPattern("/propertiesxyz", "/properties/*")).toBe(false);
    expect(matchPattern("/find-property", "/properties/*")).toBe(false);
  });

  it("matches an exact pattern with no wildcard", () => {
    expect(matchPattern("/login", "/login")).toBe(true);
    expect(matchPattern("/login/extra", "/login")).toBe(false);
  });
});

describe("route protection", () => {
  it("gates every agent/owner/admin property route", () => {
    for (const path of [
      "/properties",
      "/properties/create",
      "/properties/abc",
      "/properties/abc/edit",
    ]) {
      expect(isProtectedRoute(path)).toBe(true);
      expect(getAllowedRolesForRoute(path)).toEqual([
        "agent",
        "owner",
        "admin",
      ]);
    }
  });

  it("gates the tenant route", () => {
    expect(isProtectedRoute("/find-property")).toBe(true);
    expect(getAllowedRolesForRoute("/find-property")).toEqual(["tenant"]);
  });

  it("gates the admin-only users and requests routes", () => {
    expect(isProtectedRoute("/users")).toBe(true);
    expect(getAllowedRolesForRoute("/users")).toEqual(["admin"]);
    expect(isProtectedRoute("/requests")).toBe(true);
    expect(getAllowedRolesForRoute("/requests")).toEqual(["admin"]);
  });

  it("leaves unlisted routes ungated", () => {
    expect(isProtectedRoute("/dashboard")).toBe(false);
  });
});
