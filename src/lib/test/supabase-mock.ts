import { vi } from "vitest";

/**
 * Builder for a Supabase client mock usable from feature tests.
 *
 * Tests stub the `@/lib/supabase/server` `createClient` factory, never the
 * repository itself, so repository logic still executes against the mock.
 *
 * The builder is a pure factory — when used inside `vi.hoisted` to wire a
 * `vi.mock("@/lib/supabase/server", ...)` factory, prefer inlining the mock
 * client (see `src/features/auth/__tests__/service.test.ts` for the canonical
 * pattern). Importing this helper from inside `vi.hoisted` won't work because
 * Node's CJS `require` cannot resolve `.ts` paths.
 *
 * @example
 * import { createSupabaseClientMock } from "@/lib/test/supabase-mock";
 * const supabase = createSupabaseClientMock({
 *   auth: {
 *     signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
 *   },
 * });
 */
export type SupabaseQueryChain = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
};

export function createQueryChain(
  overrides: Partial<Pick<SupabaseQueryChain, "single" | "eq">> = {}
): SupabaseQueryChain {
  const chain: Partial<SupabaseQueryChain> = {};

  chain.single =
    overrides.single ?? vi.fn().mockResolvedValue({ data: null, error: null });
  chain.eq = overrides.eq ?? vi.fn().mockImplementation(() => chain);
  chain.select = vi.fn().mockImplementation(() => chain);
  chain.insert = vi.fn().mockImplementation(() => chain);
  chain.update = vi.fn().mockImplementation(() => chain);
  chain.delete = vi.fn().mockImplementation(() => chain);
  chain.order = vi.fn().mockImplementation(() => chain);
  chain.limit = vi.fn().mockImplementation(() => chain);

  return chain as SupabaseQueryChain;
}

export type SupabaseClientMock = {
  auth: {
    signUp: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
};

export function createSupabaseClientMock(
  overrides: Partial<SupabaseClientMock> = {}
): SupabaseClientMock {
  return {
    auth: {
      signUp:
        overrides.auth?.signUp ??
        vi.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
      signInWithPassword:
        overrides.auth?.signInWithPassword ??
        vi.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
      signOut:
        overrides.auth?.signOut ?? vi.fn().mockResolvedValue({ error: null }),
      getUser:
        overrides.auth?.getUser ??
        vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession:
        overrides.auth?.getSession ??
        vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from:
      overrides.from ?? vi.fn().mockImplementation(() => createQueryChain()),
  };
}
