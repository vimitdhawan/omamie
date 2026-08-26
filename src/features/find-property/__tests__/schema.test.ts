import { describe, it, expect } from "vitest";
import { findPropertyFormSchema } from "../schema";

describe("Find Property Schema Validation", () => {
  const validData = {
    propertyType: "apartment",
    preferredLocation: "Sukhumvit, Bangkok",
    monthlyBudget: "18000",
    moveInDate: "2026-09-01",
    bedrooms: "2",
    bathrooms: "1",
    minSizeSqm: "35",
    furnishing: "furnished",
  };

  it("should validate correct find-property data", () => {
    const result = findPropertyFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid property type", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      propertyType: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty preferred location", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      preferredLocation: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-positive monthly budget", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      monthlyBudget: "0",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty move-in date", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      moveInDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid bedrooms value", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      bedrooms: "5",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid bathrooms value", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      bathrooms: "4",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid furnishing value", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      furnishing: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject the removed 'none' furnishing option", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      furnishing: "none",
    });
    expect(result.success).toBe(false);
  });

  it.each(["furnished", "partially", "unfurnished"])(
    "should accept furnishing value '%s'",
    (furnishing) => {
      const result = findPropertyFormSchema.safeParse({
        ...validData,
        furnishing,
      });
      expect(result.success).toBe(true);
    }
  );

  it.each(["studio", "1", "2", "3", "4+"])(
    "should accept bedrooms value '%s'",
    (bedrooms) => {
      const result = findPropertyFormSchema.safeParse({
        ...validData,
        bedrooms,
      });
      expect(result.success).toBe(true);
    }
  );

  it("should allow omitted minSizeSqm", () => {
    const rest = { ...validData };
    delete (rest as Partial<typeof validData>).minSizeSqm;
    const result = findPropertyFormSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("should reject negative minSizeSqm", () => {
    const result = findPropertyFormSchema.safeParse({
      ...validData,
      minSizeSqm: "-10",
    });
    expect(result.success).toBe(false);
  });
});
