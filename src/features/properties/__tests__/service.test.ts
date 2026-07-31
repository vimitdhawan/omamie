import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ListPropertyFormData } from "../schema";

// Mock Supabase client
const { supabase, createClient } = vi.hoisted(() => {
  const mockSupabase = {
    from: vi.fn(),
  };

  const mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

  return {
    supabase: mockSupabase,
    createClient: mockCreateClient,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { createPropertyListing } from "../service";

describe("Properties Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPropertyListing", () => {
    it("should create a property listing successfully", async () => {
      const formData: ListPropertyFormData = {
        propertyType: "apartment",
        title: "Luxury 2BR Apartment",
        location: "Sukhumvit, Bangkok",
        monthlyRent: 25000,
        description: "Beautiful apartment with great amenities",
        bedrooms: 2,
        bathrooms: 1,
        furnishedStatus: "furnished",
        amenities: ["wifi", "ac", "parking"],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const mockProperty = {
        id: "test-property-id",
        profile_id: "test",
        title: formData.title,
        property_type: formData.propertyType,
        location: formData.location,
        monthly_rent: formData.monthlyRent,
        description: formData.description,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furnished_status: formData.furnishedStatus,
        amenities: formData.amenities,
        status: "pending_review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
      };

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      const result = await createPropertyListing(formData);

      expect(result.error).toBeNull();
      expect(result.property).toEqual(mockProperty);
      expect(supabase.from).toHaveBeenCalledWith("properties");
    });

    it("should set profile_id to 'test' placeholder", async () => {
      const formData: ListPropertyFormData = {
        propertyType: "apartment",
        title: "Test Property",
        location: "Bangkok",
        monthlyRent: 20000,
        bedrooms: 1,
        bathrooms: 1,
        furnishedStatus: "unfurnished",
        amenities: [],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const mockProperty = {
        id: "test-id",
        profile_id: "test",
        title: formData.title,
        property_type: formData.propertyType,
        location: formData.location,
        monthly_rent: formData.monthlyRent,
        description: null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furnished_status: formData.furnishedStatus,
        amenities: formData.amenities,
        status: "pending_review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
      };

      const insertMock = vi.fn().mockReturnValue(mockChain);
      supabase.from.mockReturnValue({
        insert: insertMock,
      });

      await createPropertyListing(formData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_id: "test",
        })
      );
    });

    it("should set status to 'pending_review'", async () => {
      const formData: ListPropertyFormData = {
        propertyType: "condo",
        title: "Modern Condo",
        location: "Phuket",
        monthlyRent: 30000,
        bedrooms: 3,
        bathrooms: 2,
        furnishedStatus: "furnished",
        amenities: ["pool", "gym"],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const mockProperty = {
        id: "test-id",
        profile_id: "test",
        title: formData.title,
        property_type: formData.propertyType,
        location: formData.location,
        monthly_rent: formData.monthlyRent,
        description: null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furnished_status: formData.furnishedStatus,
        amenities: formData.amenities,
        status: "pending_review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
      };

      const insertMock = vi.fn().mockReturnValue(mockChain);
      supabase.from.mockReturnValue({
        insert: insertMock,
      });

      await createPropertyListing(formData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending_review",
        })
      );
    });

    it("should handle database errors gracefully", async () => {
      const formData: ListPropertyFormData = {
        propertyType: "apartment",
        title: "Test Property",
        location: "Bangkok",
        monthlyRent: 25000,
        bedrooms: 2,
        bathrooms: 1,
        furnishedStatus: "furnished",
        amenities: [],
        acceptTerms: true,
        confirmAccuracy: true,
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: "DB Error" } }),
      };

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      const result = await createPropertyListing(formData);

      expect(result.property).toBeNull();
      expect(result.error).toBe(
        "Failed to create property listing. Please try again."
      );
    });

    it("should handle optional description", async () => {
      const formData: ListPropertyFormData = {
        propertyType: "house",
        title: "Family House",
        location: "Chiang Mai",
        monthlyRent: 40000,
        bedrooms: 4,
        bathrooms: 3,
        furnishedStatus: "partial",
        amenities: ["parking"],
        acceptTerms: true,
        confirmAccuracy: true,
        // No description
      };

      const mockProperty = {
        id: "test-id",
        profile_id: "test",
        title: formData.title,
        property_type: formData.propertyType,
        location: formData.location,
        monthly_rent: formData.monthlyRent,
        description: null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furnished_status: formData.furnishedStatus,
        amenities: formData.amenities,
        status: "pending_review",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
      };

      const insertMock = vi.fn().mockReturnValue(mockChain);
      supabase.from.mockReturnValue({
        insert: insertMock,
      });

      await createPropertyListing(formData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        })
      );
    });
  });
});
