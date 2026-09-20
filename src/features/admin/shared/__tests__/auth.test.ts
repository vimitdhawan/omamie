import { describe, it, expect, vi, beforeEach } from "vitest";

const { getAuthSession } = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({ getAuthSession }));

import { requireAdmin } from "../auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin shared — requireAdmin", () => {
  it("throws UNAUTHORIZED when there is no session", async () => {
    getAuthSession.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toSatisfy((err: unknown) => {
      return err instanceof Error && err.name === "AppError";
    });
  });

  it("throws FORBIDDEN when the session role is not admin", async () => {
    getAuthSession.mockResolvedValue({ profileId: "p1", role: "owner" });

    await expect(requireAdmin()).rejects.toSatisfy((err: unknown) => {
      return (
        err instanceof Error &&
        err.name === "AppError" &&
        (err as unknown as { code: string }).code === "FORBIDDEN"
      );
    });
  });

  it("returns the profileId when the session role is admin", async () => {
    getAuthSession.mockResolvedValue({ profileId: "admin-1", role: "admin" });

    await expect(requireAdmin()).resolves.toBe("admin-1");
  });
});
