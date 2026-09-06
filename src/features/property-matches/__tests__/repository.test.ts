import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repository from "../repository";
import * as supabaseServer from "@/lib/supabase/server";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

describe("Property Matches Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMatchCounts", () => {
    it("should return match counts for a profile", async () => {
      const mockMatches = [
        { id: "m1", status: "interested" },
        { id: "m2", status: "interested" },
        { id: "m3", status: "approved" },
        { id: "m4", status: "rejected" },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockMatches, error: null }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getMatchCounts("owner-1");

      expect(result.all).toBe(4);
      expect(result.interested).toBe(2);
      expect(result.approved).toBe(1);
      expect(result.rejected).toBe(1);
    });

    it("should return zero counts when no matches found", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getMatchCounts("owner-1");

      expect(result.all).toBe(0);
      expect(result.interested).toBe(0);
      expect(result.approved).toBe(0);
      expect(result.rejected).toBe(0);
    });

    it("should handle query errors gracefully", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Query failed") }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getMatchCounts("owner-1");

      expect(result.all).toBe(0);
      expect(result.interested).toBe(0);
    });
  });

  describe("getPendingMatchesCount", () => {
    it("should return count of pending (interested) matches", async () => {
      const mockData = [{ id: "m1" }, { id: "m2" }];

      // Create a chain that properly returns itself for multiple eq calls
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getPendingMatchesCount("owner-1");

      expect(result).toBe(2);
    });

    it("should return 0 if query fails", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Query failed"),
            }),
          }),
        }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getPendingMatchesCount("owner-1");

      expect(result).toBe(0);
    });
  });

  describe("mapDatabaseMatch", () => {
    it("should correctly map database match to domain model", async () => {
      const mockMatches = [
        {
          id: "match-1",
          property_id: "prop-1",
          tenant_id: "tenant-1",
          property_owner_id: "owner-1",
          initiated_by: "tenant",
          status: "interested",
          notes: null,
          created_at: "2024-09-01T00:00:00Z",
          updated_at: "2024-09-01T00:00:00Z",
          property: {
            id: "prop-1",
            title: "Beautiful Apartment",
            location: "New York",
            monthly_rent: 2000,
          },
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockMatches, error: null }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getMatchesByProfileId("owner-1");

      expect(result[0]).toEqual({
        id: "match-1",
        propertyId: "prop-1",
        tenantId: "tenant-1",
        propertyOwnerId: "owner-1",
        initiatedBy: "tenant",
        status: "interested",
        notes: null,
        createdAt: "2024-09-01T00:00:00Z",
        updatedAt: "2024-09-01T00:00:00Z",
        property: {
          id: "prop-1",
          title: "Beautiful Apartment",
          location: "New York",
          monthlyRent: 2000,
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw AppError on query failure", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      await expect(repository.getMatchesByProfileId("owner-1")).rejects.toThrow(
        "Failed to fetch property matches"
      );
    });

    it("should handle filter combinations", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockClient = {
        from: vi.fn().mockReturnValue(mockQuery),
      };

      vi.mocked(supabaseServer.createClient).mockResolvedValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockClient as any
      );

      const result = await repository.getMatchesByProfileId("owner-1", {
        status: "approved",
        search: "apartment",
      });

      expect(result).toEqual([]);
    });
  });
});
