import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSignup, loginAction, logoutAction } from "../actions";
import { AppError } from "@/lib/errors";
import type { AuthResponse } from "@supabase/supabase-js";

const mockCreateClient = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`Redirected to ${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("../service", () => ({
  signup: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import { signup, login, logout } from "../service";
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
      expect(result.errors?.email?.[0]).toMatch(/valid email/i);
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
      expect(result.errors?.confirmPassword?.[0]).toMatch(
        /passwords do not match/i
      );
    });

    it("should return validation errors when fullName is empty", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "");
      formData.append("role", "tenant");

      const result = await handleSignup(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.fullName).toBeDefined();
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

    it("should return CONFLICT error when email already exists", async () => {
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

      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toBe("Email already exists");
      expect(result.errors).toBeUndefined();
    });

    it("should return generic error on non-AppError exceptions", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "John Doe");
      formData.append("role", "tenant");

      vi.mocked(signup).mockRejectedValueOnce(new Error("Unexpected error"));

      const result = await handleSignup(null, formData);

      expect(result.errorMessage).toBe(
        "An unexpected error occurred. Please try again later"
      );
      expect(result.errors).toBeUndefined();
    });

    it("should redirect to dashboard on successful signup", async () => {
      const formData = new FormData();
      formData.append("email", "newuser@example.com");
      formData.append("password", "ValidPassword123!");
      formData.append("confirmPassword", "ValidPassword123!");
      formData.append("fullName", "Jane Doe");
      formData.append("role", "tenant");

      const mockSignupData: AuthResponse["data"] = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { id: "123" } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session: { access_token: "token" } as any,
      };
      vi.mocked(signup).mockResolvedValueOnce(mockSignupData);

      try {
        await handleSignup(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/dashboard");
        expect(redirect).toHaveBeenCalledWith("/dashboard");
      }
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
      expect(result.errors?.email?.[0]).toMatch(/valid email/i);
    });

    it("should return validation error for short password", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "short");

      const result = await loginAction(null, formData);

      expect(result.errors).toBeDefined();
      expect(result.errors?.password).toBeDefined();
      expect(result.errors?.password?.[0]).toMatch(/at least 6/i);
    });

    it("should return UNAUTHORIZED error for invalid credentials", async () => {
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

      expect(result.error).toBe("Invalid email or password");
    });

    it("should return generic error on non-AppError exceptions", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "ValidPassword123!");

      vi.mocked(login).mockRejectedValueOnce(new Error("Network error"));

      const result = await loginAction(null, formData);

      expect(result.error).toBe(
        "An unexpected error occurred. Please try again later"
      );
    });

    it("should redirect to dashboard on successful login", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");
      formData.append("password", "ValidPassword123!");

      vi.mocked(login).mockResolvedValueOnce({ success: true });

      try {
        await loginAction(null, formData);
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/dashboard");
        expect(redirect).toHaveBeenCalledWith("/dashboard");
      }
    });
  });

  describe("logoutAction", () => {
    it("should redirect to login on successful logout", async () => {
      vi.mocked(logout).mockResolvedValueOnce({ success: true });

      try {
        await logoutAction();
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/login");
        expect(redirect).toHaveBeenCalledWith("/login");
      }
    });

    it("should redirect to login even when logout fails with AppError", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      const logoutError = new AppError("INTERNAL_ERROR", "Logout failed", 500);
      vi.mocked(logout).mockRejectedValueOnce(logoutError);

      try {
        await logoutAction();
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/login");
        expect(redirect).toHaveBeenCalledWith("/login");
      }
    });

    it("should redirect to login even when logout fails with unexpected error", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      vi.mocked(logout).mockRejectedValueOnce(new Error("Unexpected error"));

      try {
        await logoutAction();
      } catch (error: unknown) {
        const err = error as Error;
        expect(err.message).toContain("/login");
        expect(redirect).toHaveBeenCalledWith("/login");
      }
    });

    it("should always attempt local signOut as fallback", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabase);

      vi.mocked(logout).mockRejectedValueOnce(new Error("Logout failed"));

      try {
        await logoutAction();
      } catch {
        expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({
          scope: "local",
        });
      }
    });
  });
});
