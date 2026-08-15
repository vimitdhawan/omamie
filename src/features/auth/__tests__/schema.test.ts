import { describe, expect, it } from "vitest";
import {
  loginFormSchema,
  signupFormSchema,
  roleEnum,
  USER_ROLES,
} from "../schema";

describe("loginFormSchema", () => {
  it("accepts a valid email and a 6+ character password", () => {
    const parsed = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "ValidPassword123!",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const parsed = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "ValidPassword123!",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/valid email/i);
    }
  });

  it("rejects a password shorter than 6 characters", () => {
    const parsed = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "abc",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toMatch(/at least 6/i);
    }
  });
});

describe("signupFormSchema", () => {
  const validBase = {
    email: "user@example.com",
    password: "ValidPassword123!",
    confirmPassword: "ValidPassword123!",
    fullName: "Ada Lovelace",
    role: "tenant",
  };

  it("accepts a valid payload with matching passwords", () => {
    expect(signupFormSchema.safeParse(validBase).success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const parsed = signupFormSchema.safeParse({
      ...validBase,
      confirmPassword: "different",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const confirmIssue = parsed.error.issues.find(
        (issue) => issue.path[0] === "confirmPassword"
      );
      expect(confirmIssue?.message).toMatch(/passwords do not match/i);
    }
  });

  it("rejects a missing full name", () => {
    const parsed = signupFormSchema.safeParse({
      ...validBase,
      fullName: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown role", () => {
    const parsed = signupFormSchema.safeParse({
      ...validBase,
      role: "admin",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("roleEnum", () => {
  it.each(["agent", "owner", "tenant"])("accepts role '%s'", (role) => {
    expect(roleEnum.safeParse(role).success).toBe(true);
  });

  it("exposes matching human-readable labels", () => {
    expect(USER_ROLES).toEqual({
      agent: "Agent",
      owner: "Owner",
      tenant: "Tenant",
    });
  });
});
