import { vi } from "vitest";

export const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

export function createMockSupabaseError(
  message: string,
  status?: number
): { message: string; status: number; code: undefined } {
  return {
    message,
    status: status || 500,
    code: undefined,
  };
}

export function resetMocks() {
  vi.clearAllMocks();
}

// ---------------------------------------------------------------------------
// Chainable query builder
//
// PostgREST calls read as `.select().eq().order().single()`, and the builder above can only
// model two levels. This one returns itself from every chainable method and resolves to the
// supplied result, so a query of any shape can be mocked with one value.
// ---------------------------------------------------------------------------

export type QueryResult<T = unknown> = {
  data: T;
  error: { code?: string; message?: string } | null;
  count?: number;
};

const CHAINABLE = [
  "select",
  "insert",
  "update",
  "upsert",
  "delete",
  "eq",
  "neq",
  "in",
  "is",
  "or",
  "not",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "contains",
  "order",
  "limit",
  "range",
  "match",
] as const;

export function createMockQueryBuilder<T>(result: QueryResult<T>) {
  const builder: Record<string, unknown> = {};

  for (const method of CHAINABLE) {
    builder[method] = vi.fn(() => builder);
  }

  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Awaiting the builder directly (no terminal method) must also resolve.
  builder.then = (
    onFulfilled: (value: QueryResult<T>) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return builder;
}

type RpcResult = {
  data: unknown;
  error: { code?: string; message?: string } | null;
};

export function createMockStorageBucket() {
  return {
    upload: vi.fn(() => Promise.resolve({ data: { path: "x" }, error: null })),
    remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
    list: vi.fn(() => Promise.resolve({ data: [], error: null })),
  };
}

/** An RLS-scoped client with a settable query result and a mockable `rpc`. */
export function createMockClient(
  result: QueryResult<unknown> = { data: null as unknown, error: null }
) {
  const builder = createMockQueryBuilder(result);
  return {
    from: vi.fn(() => builder),
    rpc: vi.fn((): Promise<RpcResult> =>
      Promise.resolve({ data: null, error: null })
    ),
    storage: { from: vi.fn(() => createMockStorageBucket()) },
    __builder: builder,
  };
}
