import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repository from "../repository";
import * as supabaseServer from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getViewingsByMatchId", () => {
  it("maps every row for a match to the domain model", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "viewing-1",
            match_id: "match-1",
            status: "requested",
            scheduled_at: "2026-09-27T14:00:00Z",
            host_name: null,
            access_notes: null,
            created_at: "2026-09-10T00:00:00Z",
            updated_at: "2026-09-10T00:00:00Z",
          },
        ],
        error: null,
      }),
    };

    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(mockQuery),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await repository.getViewingsByMatchId("match-1");

    expect(result).toEqual([
      {
        id: "viewing-1",
        matchId: "match-1",
        status: "requested",
        scheduledAt: "2026-09-27T14:00:00Z",
        hostName: null,
        accessNotes: null,
        createdAt: "2026-09-10T00:00:00Z",
        updatedAt: "2026-09-10T00:00:00Z",
      },
    ]);
  });
});

describe("getViewingsByMatchIds", () => {
  it("groups rows by match id", async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "viewing-1",
            match_id: "match-1",
            status: "requested",
            scheduled_at: "2026-09-27T14:00:00Z",
            host_name: null,
            access_notes: null,
            created_at: "2026-09-10T00:00:00Z",
            updated_at: "2026-09-10T00:00:00Z",
          },
          {
            id: "viewing-2",
            match_id: "match-1",
            status: "requested",
            scheduled_at: "2026-09-28T14:00:00Z",
            host_name: null,
            access_notes: null,
            created_at: "2026-09-11T00:00:00Z",
            updated_at: "2026-09-11T00:00:00Z",
          },
          {
            id: "viewing-3",
            match_id: "match-2",
            status: "confirmed",
            scheduled_at: "2026-09-29T14:00:00Z",
            host_name: "Marcus",
            access_notes: null,
            created_at: "2026-09-12T00:00:00Z",
            updated_at: "2026-09-12T00:00:00Z",
          },
        ],
        error: null,
      }),
    };

    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(mockQuery),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await repository.getViewingsByMatchIds([
      "match-1",
      "match-2",
    ]);

    expect(result["match-1"]).toHaveLength(2);
    expect(result["match-2"]).toHaveLength(1);
    expect(result["match-2"][0].hostName).toBe("Marcus");
  });

  it("returns an empty object without querying for an empty id list", async () => {
    const result = await repository.getViewingsByMatchIds([]);
    expect(result).toEqual({});
    expect(supabaseServer.createClient).not.toHaveBeenCalled();
  });
});

describe("replaceProposedSlots", () => {
  it("deletes prior proposals and inserts the new set", async () => {
    const insertedRows = [
      {
        id: "viewing-4",
        match_id: "match-1",
        status: "requested",
        scheduled_at: "2026-10-01T10:00:00Z",
        host_name: null,
        access_notes: null,
        created_at: "2026-09-13T00:00:00Z",
        updated_at: "2026-09-13T00:00:00Z",
      },
    ];

    const deleteChain = {
      eq: vi.fn().mockReturnThis(),
    };
    // The second .eq() on the delete chain must resolve.
    deleteChain.eq = vi
      .fn()
      .mockReturnValueOnce(deleteChain)
      .mockResolvedValueOnce({ error: null });

    const insertChain = {
      select: vi.fn().mockResolvedValue({ data: insertedRows, error: null }),
    };

    const mockClient = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue(deleteChain),
        insert: vi.fn().mockReturnValue(insertChain),
      }),
    };

    vi.mocked(supabaseServer.createServiceRoleClient).mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockClient as any
    );

    const result = await repository.replaceProposedSlots("match-1", [
      "2026-10-01T10:00:00Z",
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("viewing-4");
  });
});
