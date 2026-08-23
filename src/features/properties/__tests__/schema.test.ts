import { describe, it, expect } from "vitest";
import {
  basicDetailsSchema,
  amenitiesSchema,
  reviewSchema,
  listPropertySchema,
} from "../schema";

// Backward compatibility aliases for test readability
const step1Schema = basicDetailsSchema;
const step2Schema = amenitiesSchema;
const step3Schema = reviewSchema;

describe("Properties Schema Validation", () => {
  describe("Step 1 Schema (Property Details)", () => {
    it("should validate correct property details", () => {
      const validData = {
        propertyType: "apartment",
        title: "Luxury 2BR Apartment",
        location: "Sukhumvit, Bangkok",
        monthlyRent: 25000,
        bedrooms: 2,
        bathrooms: 1,
        description: "Beautiful apartment with great amenities",
      };

      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid property type", () => {
      const invalidData = {
        propertyType: "invalid",
        title: "Test Property",
        location: "Bangkok",
        monthlyRent: 25000,
      };

      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title that is too short", () => {
      const invalidData = {
        propertyType: "apartment",
        title: "AB",
        location: "Bangkok",
        monthlyRent: 25000,
      };

      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 5");
      }
    });

    it("should reject negative monthly rent", () => {
      const invalidData = {
        propertyType: "apartment",
        title: "Test Property",
        location: "Bangkok",
        monthlyRent: -1000,
      };

      const result = step1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should allow optional description", () => {
      const validData = {
        propertyType: "apartment",
        title: "Test Property",
        location: "Bangkok",
        monthlyRent: 25000,
        bedrooms: 2,
        bathrooms: 1,
      };

      const result = step1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Step 2 Schema (Amenities)", () => {
    it("should validate correct amenities data", () => {
      const validData = {
        furnishedStatus: "furnished",
        amenities: ["wifi", "ac", "parking"],
      };

      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid furnished status", () => {
      const invalidData = {
        furnishedStatus: "invalid",
        amenities: [],
      };

      const result = step2Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid amenity values", () => {
      const invalidData = {
        furnishedStatus: "furnished",
        amenities: ["invalid_amenity"],
      };

      const result = step2Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept empty amenities array", () => {
      const validData = {
        furnishedStatus: "furnished",
        amenities: [],
      };

      const result = step2Schema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amenities).toEqual([]);
      }
    });
  });

  describe("Step 3 Schema (Review)", () => {
    it("should validate when both checkboxes are true", () => {
      const validData = {
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const result = step3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when acceptTerms is false", () => {
      const invalidData = {
        acceptTerms: false,
        confirmAccuracy: true,
      };

      const result = step3Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject when confirmAccuracy is false", () => {
      const invalidData = {
        acceptTerms: true,
        confirmAccuracy: false,
      };

      const result = step3Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Combined List Property Schema", () => {
    it("should validate complete valid form data", () => {
      const validData = {
        propertyType: "apartment",
        title: "Luxury 2BR Apartment",
        location: "Sukhumvit, Bangkok",
        monthlyRent: 25000,
        description: "Beautiful apartment",
        bedrooms: 2,
        bathrooms: 1,
        furnishedStatus: "furnished",
        amenities: ["wifi", "ac"],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const result = listPropertySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject if any step is invalid", () => {
      const invalidData = {
        propertyType: "apartment",
        title: "AB", // Too short
        location: "Sukhumvit, Bangkok",
        monthlyRent: 25000,
        bedrooms: 2,
        bathrooms: 1,
        furnishedStatus: "furnished",
        amenities: [],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const result = listPropertySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
