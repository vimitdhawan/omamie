import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSignup, loginAction, logoutAction } from "../actions";
import { AppError } from "@/lib/errors";

const mockCreateClient = vi.hoisted(() => vi.fn());
const mockGetAuthSession = vi.hoisted(() => vi.fn());
const mockSetAuthSession = vi.hoisted(() => vi.fn());
const mockDeleteAuthSession = vi.hoisted(() => vi.fn());
const mockGetUserWithProfile = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT: ${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/lib/auth-session", () => ({
  getAuthSession: mockGetAuthSession,
  setAuthSession: mockSetAuthSession,
  deleteAuthSession: mockDeleteAuthSession,
  getRoleBasedRedirectPath: (role: string) => {
    const paths: Record<string, string> = {
      tenant: "/find-property",
      agent: "/list-property",
      owner: "/list-property",
    };
    return paths[role] || "/login";
  },
}));

vi.mock("@/features/profile/repository", () => ({
  getUserWithProfile: mockGetUserWithProfile,
}));

vi.mock("../service", () => ({
  signup: vi.fn(),
  login: vi.fn(),
}));

import { signup, login } from "../service";
import { redirect } from "next/navigation";

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSignup", () => {
    it("should return validation errors when email is invalid", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "tenant");

      const result = await handleSignup(null, formData);

      expect(result.success).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toBeDefined();
    });

    it("should return validation errors when passwords do not match", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "DifferentPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "tenant");

      const result = await handleSignup(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.confirmPassword).toBeDefined();
    });

    it("should return validation errors for invalid role", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "invalid-role");

      const result = await handleSignup(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.role).toBeDefined();
    });

    it("should return error when signup service fails", async () => {
      const formData = new FormData();
      formData.append("email", "existing@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "tenant");

      const conflictError = new AppError(
        "CONFLICT",
        "Email already exists",
        409
      );
      vi.mocked(signup).mockRejectedValueOnce(conflictError);

      const result = await handleSignup(null, formData);

      expect(result.errorMessage).toBe("Email already exists");
      expect(result.errors).toBeUndefined();
    });

    it("should return error when user is null after signup", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      const result = await handleSignup(null, formData);

      expect(result.errorMessage).toBe(
        "Authentication failed. Please try again."
      );
    });

    it("should return error when profile fetch fails", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      const result = await handleSignup(null, formData);

      expect(result.errorMessage).toBe(
        "Failed to load profile. Please try again."
      );
    });

    it("should call setAuthSession with profile data on successful signup", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-123",
        role: "tenant",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      try {
        await handleSignup(null, formData);
      } catch {
        // redirect throws
      }

      expect(mockSetAuthSession).toHaveBeenCalledWith("profile-123", "tenant");
    });

    it("should redirect to /find-property for tenant role", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-123",
        role: "tenant",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      try {
        await handleSignup(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/find-property");
        expect(redirect).toHaveBeenCalledWith("/find-property");
      }
    });

    it("should redirect to /list-property for agent role", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "agent");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-123",
        role: "agent",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      try {
        await handleSignup(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/list-property");
        expect(redirect).toHaveBeenCalledWith("/list-property");
      }
    });

    it("should redirect to /list-property for owner role", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "owner");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-123",
        role: "owner",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      try {
        await handleSignup(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/list-property");
      }
    });

    it("should return error if redirect does not happen", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(signup).mockResolvedValueOnce(undefined as any);

      const result = await handleSignup(null, formData);

      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain("Authentication failed");
    });
  });

  describe("loginAction", () => {
    it("should return validation error for invalid email", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "ValidPassword123!");

      const result = await loginAction(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toBeDefined();
    });

    it("should return validation error for short password", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "short");

      const result = await loginAction(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.password).toBeDefined();
    });

    it("should return error for invalid credentials", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "WrongPassword123!");

      const unauthorizedError = new AppError(
        "UNAUTHORIZED",
        "Invalid email or password",
        401
      );
      vi.mocked(login).mockRejectedValueOnce(unauthorizedError);

      const result = await loginAction(null, formData);

      expect(result.errorMessage).toBe("Invalid email or password");
    });

    it("should return error when user is null", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      const result = await loginAction(null, formData);

      expect(result.errorMessage).toBe(
        "Authentication failed. Please try again."
      );
    });

    it("should return error when profile fetch fails", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue(null);
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      const result = await loginAction(null, formData);

      expect(result.errorMessage).toBe(
        "Failed to load profile. Please try again."
      );
    });

    it("should call setAuthSession with profile data on successful login", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-456",
        role: "agent",
      });
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      try {
        await loginAction(null, formData);
      } catch {
        // redirect throws
      }

      expect(mockSetAuthSession).toHaveBeenCalledWith("profile-456", "agent");
    });

    it("should redirect to /find-property for tenant role on login", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-456",
        role: "tenant",
      });
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      try {
        await loginAction(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/find-property");
        expect(redirect).toHaveBeenCalledWith("/find-property");
      }
    });

    it("should redirect to /list-property for agent role on login", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      mockGetUserWithProfile.mockResolvedValue({
        id: "profile-456",
        role: "agent",
      });
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      try {
        await loginAction(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/list-property");
      }
    });

    it("should return error if redirect does not happen", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);
      vi.mocked(login).mockResolvedValueOnce({ success: true });

      const result = await loginAction(null, formData);

      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain("Authentication failed");
    });
  });

  describe("logoutAction", () => {
    it("should call deleteAuthSession", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      try {
        await logoutAction();
      } catch {
        // redirect throws
      }

      expect(mockDeleteAuthSession).toHaveBeenCalled();
    });

    it("should call supabase auth signOut with local scope", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      try {
        await logoutAction();
      } catch {
        // redirect throws
      }

      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({
        scope: "local",
      });
    });

    it("should redirect to login after logout", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      try {
        await logoutAction();
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/login");
        expect(redirect).toHaveBeenCalledWith("/login");
      }
    });

    it("should still redirect to login even when signOut fails", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockRejectedValue(new Error("Logout failed")),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      try {
        await logoutAction();
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/login");
      }

      expect(mockDeleteAuthSession).toHaveBeenCalled();
    });
  });
});
