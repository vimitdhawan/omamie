import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "@/lib/errors";
import { signUp, signIn, signOut } from "../repository";

const mockCreateClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("Auth Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUp", () => {
    it("should return user data on successful signup", async () => {
      const mockData = {
        user: { id: "123", email: "test@example.com" },
        session: { access_token: "token" },
      };

      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      const data = await signUp({
        email: "test@example.com",
        password: "Password123!",
        fullName: "John Doe",
        role: "tenant",
      });

      expect(data).toEqual(mockData);
    });

    it("should throw CONFLICT error on duplicate email", async () => {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: "duplicate key value violates unique constraint",
              status: 409,
            },
          }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      await expect(
        signUp({
          email: "test@example.com",
          password: "Password123!",
          fullName: "John Doe",
          role: "tenant",
        })
      ).rejects.toThrow(AppError);
    });

    it.each([
      [
        {
          message: "duplicate key value violates unique constraint",
          status: 409,
        },
        "CONFLICT",
      ],
      [{ message: "Internal server error", status: 500 }, "INTERNAL_ERROR"],
      [{ message: "network timeout", status: 0 }, "EXTERNAL_SERVICE_ERROR"],
    ])(
      "should throw appropriate error for %s",
      async (supabaseError, expectedCode) => {
        const mockSupabase = {
          auth: {
            signUp: vi.fn().mockResolvedValue({
              data: null,
              error: supabaseError,
            }),
          },
        };

        mockCreateClient.mockResolvedValue(mockSupabase);

        try {
          await signUp({
            email: "test@example.com",
            password: "Password123!",
            fullName: "John Doe",
            role: "tenant",
          });
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect((error as AppError).code).toBe(expectedCode);
        }
      }
    );
  });

  describe("signIn", () => {
    it("should return user data on successful login", async () => {
      const mockData = {
        user: { id: "123", email: "test@example.com" },
        session: { access_token: "token" },
      };

      const mockSupabase = {
        auth: {
          signInWithPassword: vi
            .fn()
            .mockResolvedValue({ data: mockData, error: null }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      const data = await signIn("test@example.com", "password");

      expect(data).toEqual(mockData);
    });

    it("should throw UNAUTHORIZED on invalid credentials", async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Invalid login credentials", status: 401 },
          }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      await expect(signIn("test@example.com", "wrongpassword")).rejects.toThrow(
        AppError
      );
    });
  });

  describe("signOut", () => {
    it("should complete successfully", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      await expect(signOut()).resolves.not.toThrow();
    });

    it("should throw error on logout failure", async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({
            error: { message: "Logout failed", status: 500 },
          }),
        },
      };

      mockCreateClient.mockResolvedValue(mockSupabase);

      await expect(signOut()).rejects.toThrow(AppError);
    });
  });
});
