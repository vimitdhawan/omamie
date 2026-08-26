import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "@/lib/errors";
import { createFindPropertyRequest } from "../repository";
import type { CreatePropertyFindRequestInput } from "../types";

const mockCreateClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

const input: CreatePropertyFindRequestInput = {
  profileId: "profile-1",
  propertyType: "apartment",
  preferredLocation: "Sukhumvit, Bangkok",
  monthlyBudget: 18000,
  moveInDate: "2026-09-01",
  bedrooms: "2",
  bathrooms: "1",
  minSizeSqm: 35,
  furnishing: "furnished",
};

function mockSupabaseInsert(result: { data?: unknown; error?: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  mockCreateClient.mockResolvedValue({ from });
  return { from, insert, select, single };
}

describe("Find Property Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFindPropertyRequest", () => {
    it("maps camelCase input to the snake_case insert payload", async () => {
      const { from, insert } = mockSupabaseInsert({
        data: {
          id: "request-1",
          profile_id: input.profileId,
          property_type: input.propertyType,
          preferred_location: input.preferredLocation,
          monthly_budget: input.monthlyBudget,
          move_in_date: input.moveInDate,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          min_size_sqm: input.minSizeSqm,
          furnishing: input.furnishing,
          created_at: "2026-08-01T00:00:00.000Z",
          updated_at: "2026-08-01T00:00:00.000Z",
        },
        error: null,
      });

      await createFindPropertyRequest(input);

      expect(from).toHaveBeenCalledWith("property_find_requests");
      expect(insert).toHaveBeenCalledWith({
        profile_id: input.profileId,
        property_type: input.propertyType,
        preferred_location: input.preferredLocation,
        monthly_budget: input.monthlyBudget,
        move_in_date: input.moveInDate,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        min_size_sqm: input.minSizeSqm,
        furnishing: input.furnishing,
      });
    });

    it("defaults a missing minSizeSqm to null on insert", async () => {
      const { insert } = mockSupabaseInsert({
        data: { ...input, id: "request-1", min_size_sqm: null },
        error: null,
      });

      await createFindPropertyRequest({ ...input, minSizeSqm: undefined });

      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({ min_size_sqm: null })
      );
    });

    it("maps the inserted row back to a camelCase domain object", async () => {
      mockSupabaseInsert({
        data: {
          id: "request-1",
          profile_id: input.profileId,
          property_type: input.propertyType,
          preferred_location: input.preferredLocation,
          monthly_budget: input.monthlyBudget,
          move_in_date: input.moveInDate,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          min_size_sqm: input.minSizeSqm,
          furnishing: input.furnishing,
          created_at: "2026-08-01T00:00:00.000Z",
          updated_at: "2026-08-01T00:00:00.000Z",
        },
        error: null,
      });

      const result = await createFindPropertyRequest(input);

      expect(result).toEqual({
        id: "request-1",
        profileId: input.profileId,
        propertyType: input.propertyType,
        preferredLocation: input.preferredLocation,
        monthlyBudget: input.monthlyBudget,
        moveInDate: input.moveInDate,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        minSizeSqm: input.minSizeSqm,
        furnishing: input.furnishing,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      });
    });

    it.each([
      [
        "23502",
        "Required fields are missing. Please check all fields are filled.",
      ],
      ["23503", "Invalid user profile. Please log in again."],
      ["23505", "This request already exists."],
      ["42P01", "Service temporarily unavailable. Please try again later."],
      ["HV000", "Service temporarily unavailable. Please try again later."],
    ])(
      "maps Postgres error code %s to a user-facing message",
      async (code, message) => {
        mockSupabaseInsert({
          data: null,
          error: { code, message: "db error" },
        });

        await expect(createFindPropertyRequest(input)).rejects.toThrow(
          AppError
        );

        try {
          await createFindPropertyRequest(input);
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          expect((error as AppError).message).toBe(message);
          expect((error as AppError).code).toBe("INTERNAL_ERROR");
        }
      }
    );

    it("falls back to a generic message for unknown error codes", async () => {
      mockSupabaseInsert({
        data: null,
        error: { code: "UNKNOWN", message: "something broke" },
      });

      await expect(createFindPropertyRequest(input)).rejects.toThrow(
        "Failed to submit property find request"
      );
    });
  });
});
