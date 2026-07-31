import { describe, expect, it } from "vitest";
import { contactSchema, type ContactFormData } from "../schema";

const validContactData: ContactFormData = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 000-0000",
  subject: "general",
  message: "I would like to know more about your property listings.",
};

describe("contact schema", () => {
  it("accepts valid contact data with all fields", () => {
    const result = contactSchema.safeParse(validContactData);
    expect(result.success).toBe(true);
  });

  it("accepts valid contact data without optional phone field", () => {
    const data = { ...validContactData, phone: "" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts valid contact data with phone omitted", () => {
    const data = { ...validContactData, phone: undefined };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects full name that is too short", () => {
    const data = { ...validContactData, fullName: "a" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 2");
    }
  });

  it("rejects full name that is too long", () => {
    const data = { ...validContactData, fullName: "a".repeat(101) };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const data = { ...validContactData, email: undefined };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const data = { ...validContactData, email: "" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const data = { ...validContactData, email: "invalid-email" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("valid email");
    }
  });

  it("rejects phone that is too long", () => {
    const data = { ...validContactData, phone: "1".repeat(31) };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts every valid subject enum value", () => {
    const subjects = [
      "listing",
      "finding",
      "partnership",
      "general",
      "feedback",
      "issue",
      "other",
    ] as const;
    for (const subject of subjects) {
      const data = { ...validContactData, subject };
      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid subject enum value", () => {
    const data = { ...validContactData, subject: "invalid" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing subject", () => {
    const data = { ...validContactData, subject: undefined };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects message that is too short", () => {
    const data = { ...validContactData, message: "short" };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 10");
    }
  });

  it("rejects message that is too long", () => {
    const data = { ...validContactData, message: "a".repeat(2001) };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("trims whitespace from string fields", () => {
    const data = {
      fullName: "  John Doe  ",
      email: "  john@example.com  ",
      phone: "  +1 (555) 000-0000  ",
      subject: "general",
      message: "  I would like to know more.  ",
    };
    const result = contactSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
      expect(result.data.phone).toBe("+1 (555) 000-0000");
      expect(result.data.message).toBe("I would like to know more.");
    }
  });
});
