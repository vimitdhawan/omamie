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
