import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist the mock client so the `vi.mock` factory (which is itself hoisted
// above all imports) can safely reference it. We build the client inline
// rather than importing the helper, because inside `vi.hoisted` the CJS
// `require` cannot resolve `.ts` modules.
const { supabase, createClient } = vi.hoisted(() => {
  const fn = <T = unknown>() =>
    vi.fn() as unknown as ReturnType<typeof vi.fn> & T;
  const signUp = fn();
  const signInWithPassword = fn();
  const signOut = fn();
  const getUser = fn();
  const getSession = fn();
  const from = fn();
  const client = {
    auth: { signUp, signInWithPassword, signOut, getUser, getSession },
    from,
  };
  return { supabase: client, createClient: vi.fn().mockResolvedValue(client) };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import {
  signUp as repoSignUp,
  signIn as repoSignIn,
  signOut as repoSignOut,
  getUser as repoGetUser,
  getProfile as repoGetProfile,
} from "../repository";
import { signup, login, logout, getCurrentUser } from "../service";

/**
 * Configures `supabase.from(...)` to return a chain that resolves to the
 * provided `{ data, error }` from `.single()`. The returned `single` mock is
 * the same function that fires — useful for `toHaveBeenCalledWith` asserts.
 *
 * Each chaining method returns the same chain object so Supabase-style
 * `from(t).select().eq().single()` call sequences work end-to-end.
 */
function setFromChain(
  client: { from: ReturnType<typeof vi.fn> },
  resolved: { data: unknown; error: unknown }
) {
  const single = vi.fn().mockResolvedValue(resolved);
  const select = vi.fn().mockReturnThis();
  const eq = vi.fn().mockReturnThis();
  const chain = { select, eq, single };
  client.from.mockImplementation(() => chain);
  return single;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Re-bind the resolved value in case a test reassigned the mock return.
  createClient.mockResolvedValue(supabase);
  // Restore default no-op resolves so each test opts into specific behavior.
  supabase.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
  supabase.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
  supabase.auth.signOut.mockResolvedValue({ error: null });
  supabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
  supabase.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  // Default `from(...).select().eq().single()` resolves to no row + no error.
  setFromChain(supabase, { data: null, error: null });
});

describe("auth service — signup orchestration", () => {
  it("returns success with email-confirmation message when no session is created", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: null },
      error: null,
    });

    const result = await signup({
      email: "user@example.com",
      password: "secret1",
      fullName: "Ada",
      role: "tenant",
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        password: "secret1",
        options: { data: { full_name: "Ada", role: "tenant" } },
      })
    );
    expect(result).toEqual({
      success: true,
      message: "Check your email to confirm your account before signing in.",
    });
  });

  it("returns bare success when a session is created", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: { access_token: "abc" } },
      error: null,
    });

    const result = await signup({
      email: "user@example.com",
      password: "secret1",
      fullName: "Ada",
      role: "tenant",
    });
    expect(result).toEqual({ success: true });
  });

  it("maps the 'User already registered' error to a friendly message", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: "User already registered" },
    });

    const result = await signup({
      email: "user@example.com",
      password: "secret1",
      fullName: "Ada",
      role: "tenant",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("An account with this email already exists");
  });

  it("passes server error through unchanged when unmapped", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Some unexpected response" },
    });

    const result = await signup({
      email: "user@example.com",
      password: "secret1",
      fullName: "Ada",
      role: "tenant",
    });
    expect(result.error).toBe("Some unexpected response");
  });
});

describe("auth service — login orchestration", () => {
  it("returns success on a valid sign-in", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: { access_token: "abc" } },
      error: null,
    });

    const result = await login({
      email: "user@example.com",
      password: "secret1",
    });
    expect(result).toEqual({ success: true });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret1",
    });
  });

  it("maps 'Invalid login credentials' to a friendly message", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    const result = await login({
      email: "user@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email or password");
  });
});

describe("auth service — logout orchestration", () => {
  it("returns success on clean logout", async () => {
    supabase.auth.signOut.mockResolvedValueOnce({ error: null });
    const result = await logout();
    expect(result).toEqual({ success: true });
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("forwards logout failure as a mapped error", async () => {
    supabase.auth.signOut.mockResolvedValueOnce({
      error: { message: "unknown" },
    });
    const result = await logout();
    expect(result.success).toBe(false);
    expect(result.error).toBe("unknown");
  });
});

describe("auth repository — direct Supabase calls", () => {
  it("signIn calls signInWithPassword with the supplied credentials", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: { access_token: "abc" } },
      error: null,
    });
    const { error } = await repoSignIn("user@example.com", "secret1");
    expect(error).toBeNull();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret1",
    });
  });

  it("signOut forwards the local scope flag", async () => {
    supabase.auth.signOut.mockResolvedValueOnce({ error: null });
    const { error } = await repoSignOut();
    expect(error).toBeNull();
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("signUp surfaces auth errors verbatim", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Email rate limit exceeded" },
    });
    const { data, error } = await repoSignUp({
      email: "user@example.com",
      password: "secret1",
      fullName: "Ada",
      role: "tenant",
    });
    expect(data).toBeNull();
    expect(error).toEqual({ message: "Email rate limit exceeded" });
  });
});

describe("auth repository — getUser + getProfile", () => {
  it("getUser returns the auth user on success", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "user@example.com" } },
      error: null,
    });
    const { user, error } = await repoGetUser();
    expect(error).toBeNull();
    expect(user).toEqual({ id: "u1", email: "user@example.com" });
  });

  it("getUser returns null user + forwards error on auth failure", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "JWT expired" },
    });
    const { user, error } = await repoGetUser();
    expect(user).toBeNull();
    expect(error).toEqual({ message: "JWT expired" });
  });

  it("getProfile queries the profiles table by id and returns the row", async () => {
    const profile = {
      id: "u1",
      email: "user@example.com",
      full_name: "Ada",
      role: "tenant" as const,
      created_at: "2026-01-01T00:00:00Z",
    };
    const single = setFromChain(supabase, { data: profile, error: null });

    const { profile: result, error } = await repoGetProfile("u1");
    expect(error).toBeNull();
    expect(result).toEqual(profile);
    expect(single).toHaveBeenCalledTimes(1);
  });

  it("getProfile forwards the error when the row is missing", async () => {
    setFromChain(supabase, {
      data: null,
      error: {
        message: "JSON object requested, multiple (or no) rows returned",
      },
    });

    const { profile, error } = await repoGetProfile("missing-id");
    expect(profile).toBeNull();
    expect(error).toEqual({
      message: "JSON object requested, multiple (or no) rows returned",
    });
  });
});

describe("auth service — getCurrentUser orchestration", () => {
  it("returns null user + null profile when getUser has no session", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    setFromChain(supabase, {
      data: null,
      error: { message: "no rows" },
    });

    const result = await getCurrentUser();
    expect(result).toEqual({ user: null, profile: null });
  });

  it("returns just the user when getUser succeeds but getProfile finds no row", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "user@example.com" } },
      error: null,
    });
    setFromChain(supabase, {
      data: null,
      error: { message: "Row not found" },
    });

    const result = await getCurrentUser();
    expect(result.user).toEqual({ id: "u1", email: "user@example.com" });
    expect(result.profile).toBeNull();
  });

  it("returns user + profile when both succeed", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "user@example.com" } },
      error: null,
    });
    const profile = {
      id: "u1",
      email: "user@example.com",
      full_name: "Ada",
      role: "tenant" as const,
      created_at: "2026-01-01T00:00:00Z",
    };
    setFromChain(supabase, { data: profile, error: null });

    const result = await getCurrentUser();
    expect(result.user).toEqual({ id: "u1", email: "user@example.com" });
    expect(result.profile).toEqual(profile);
  });

  it("returns null user + null profile when getUser errors", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "session missing" },
    });

    const result = await getCurrentUser();
    expect(result).toEqual({ user: null, profile: null });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
