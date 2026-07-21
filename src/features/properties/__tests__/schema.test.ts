import { describe, expect, it } from "vitest";
import { listPropertySchema, updatePropertySchema } from "../schema";
import type { ListPropertyFormData } from "../schema";

const validPropertyData: ListPropertyFormData = {
  listingRole: "owner",
  propertyType: "condo",
  location: "Sukhumvit Soi 11, Bangkok",
  rentAmount: 25000,
  currency: "THB",
  bedrooms: 2,
  bathrooms: 2,
  furnishing: "fully",
  amenities: ["air_conditioning", "wifi", "parking"],
  contactName: "John Doe",
  contactEmail: "john@example.com",
  contactPhone: "+66 81 234 5678",
  acceptTerms: true,
  acceptMarketing: false,
  status: "draft",
};

describe("properties schema", () => {
  describe("listPropertySchema", () => {
    it("accepts valid property data", () => {
      const result = listPropertySchema.safeParse(validPropertyData);
      expect(result.success).toBe(true);
    });

    it("rejects location too short", () => {
      const data = { ...validPropertyData, location: "Hi" };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 5");
      }
    });

    it("rejects invalid property type", () => {
      const data = {
        ...validPropertyData,
        propertyType: "invalid" as
          | "apartment"
          | "condo"
          | "house"
          | "townhouse",
      };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects rent amount less than 1", () => {
      const data = { ...validPropertyData, rentAmount: 0 };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const data = { ...validPropertyData, contactEmail: "invalid-email" };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects phone too short", () => {
      const data = { ...validPropertyData, contactPhone: "123" };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects when acceptTerms is false", () => {
      const data = { ...validPropertyData, acceptTerms: false };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("accept the terms");
      }
    });

    it("rejects when both bedrooms and bathrooms are 0", () => {
      const data = { ...validPropertyData, bedrooms: 0, bathrooms: 0 };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("bedroom or bathroom");
      }
    });

    it("accepts studio (0 bedrooms, 1 bathroom)", () => {
      const data = { ...validPropertyData, bedrooms: 0, bathrooms: 1 };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("uses default values for optional fields", () => {
      const minimalData: ListPropertyFormData = {
        listingRole: "owner",
        propertyType: "condo",
        location: "123 Test Street, Bangkok",
        rentAmount: 10000,
        bedrooms: 1,
        bathrooms: 1,
        furnishing: "none",
        amenities: [],
        contactName: "Test User",
        contactEmail: "test@example.com",
        contactPhone: "12345678",
        acceptTerms: true,
      };
      const result = listPropertySchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("THB");
        expect(result.data.furnishing).toBe("none");
        expect(result.data.status).toBe("draft");
        expect(result.data.acceptMarketing).toBe(false);
      }
    });

    it("accepts 'pending' as a valid status", () => {
      const data = { ...validPropertyData, status: "pending" };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("persists amenity strings as given (free-form)", () => {
      const data = {
        ...validPropertyData,
        amenities: ["pet_friendly", "pool", "custom_thing"],
      };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amenities).toEqual([
          "pet_friendly",
          "pool",
          "custom_thing",
        ]);
      }
    });

    it("accepts an empty amenities array", () => {
      const data = { ...validPropertyData, amenities: [] };
      const result = listPropertySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amenities).toEqual([]);
      }
    });
  });

  describe("updatePropertySchema", () => {
    it("accepts partial updates with id", () => {
      const data = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        propertyType: "apartment",
      };
      const result = updatePropertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
      const data = { id: "not-a-uuid", propertyType: "apartment" };
      const result = updatePropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("requires id field", () => {
      const data = { propertyType: "apartment" };
      const result = updatePropertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
