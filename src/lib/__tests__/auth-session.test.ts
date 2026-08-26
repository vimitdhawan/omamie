import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAuthSession,
  setAuthSession,
  deleteAuthSession,
  getRoleBasedRedirectPath,
} from "../auth-session";
import type { UserRole } from "@/types/auth";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";

describe("Auth Session Helpers", () => {
  const mockCookies = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(
      mockCookies as unknown as Awaited<ReturnType<typeof cookies>>
    );
  });

  describe("setAuthSession", () => {
    it("should write auth_session cookie with profile data", async () => {
      const profileId = "test-profile-123";
      const role: UserRole = "agent";

      await setAuthSession(profileId, role);

      expect(mockCookies.set).toHaveBeenCalledWith(
        "auth_session",
        JSON.stringify({ profileId, role }),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        })
      );
    });

    it("should set cookie expiry to 7 days", async () => {
      const before = Date.now();
      await setAuthSession("test-id", "tenant");
      const after = Date.now();

      const call = mockCookies.set.mock.calls[0];
      const options = call[2];
      const expiryTime = options.expires.getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiryTime).toBeGreaterThanOrEqual(before + sevenDaysMs);
      expect(expiryTime).toBeLessThanOrEqual(after + sevenDaysMs);
    });

    it("should handle different roles", async () => {
      const roles: UserRole[] = ["tenant", "agent", "owner"];

      for (const role of roles) {
        vi.clearAllMocks();
        await setAuthSession("profile-id", role);

        const call = mockCookies.set.mock.calls[0];
        const cookieValue = JSON.parse(call[1]);

        expect(cookieValue.role).toBe(role);
      }
    });
  });

  describe("getAuthSession", () => {
    it("should return null when cookie does not exist", async () => {
      mockCookies.get.mockReturnValue(undefined);

      const session = await getAuthSession();

      expect(session).toBeNull();
    });

    it("should read and deserialize auth_session cookie", async () => {
      const sessionData = { profileId: "test-123", role: "owner" as const };
      mockCookies.get.mockReturnValue({
        value: JSON.stringify(sessionData),
      });

      const session = await getAuthSession();

      expect(session).toEqual(sessionData);
      expect(session?.profileId).toBe("test-123");
      expect(session?.role).toBe("owner");
    });

    it("should return null if cookie JSON is invalid", async () => {
      mockCookies.get.mockReturnValue({
        value: "invalid-json{[",
      });

      const session = await getAuthSession();

      expect(session).toBeNull();
    });

    it("should return null when cookie value is empty", async () => {
      mockCookies.get.mockReturnValue({
        value: "",
      });

      const session = await getAuthSession();

      expect(session).toBeNull();
    });
  });

  describe("deleteAuthSession", () => {
    it("should delete auth_session cookie", async () => {
      await deleteAuthSession();

      expect(mockCookies.delete).toHaveBeenCalledWith("auth_session");
    });

    it("should only delete auth_session, not other cookies", async () => {
      await deleteAuthSession();

      expect(mockCookies.delete).toHaveBeenCalledTimes(1);
      expect(mockCookies.delete).toHaveBeenCalledWith("auth_session");
    });
  });

  describe("getRoleBasedRedirectPath", () => {
    it("should return /find-property for tenant", () => {
      const path = getRoleBasedRedirectPath("tenant");
      expect(path).toBe("/find-property");
    });

    it("should return /list-property for agent", () => {
      const path = getRoleBasedRedirectPath("agent");
      expect(path).toBe("/list-property");
    });

    it("should return /list-property for owner", () => {
      const path = getRoleBasedRedirectPath("owner");
      expect(path).toBe("/list-property");
    });

    it("should have consistent mapping for all roles", () => {
      const tenantPath = getRoleBasedRedirectPath("tenant");
      const agentPath = getRoleBasedRedirectPath("agent");
      const ownerPath = getRoleBasedRedirectPath("owner");

      expect(tenantPath).not.toBe(agentPath);
      expect(agentPath).toBe(ownerPath);
    });
  });
});
