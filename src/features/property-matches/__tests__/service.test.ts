import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repository from "../repository";
import * as service from "../service";
import * as viewings from "@/features/viewings/repository";
import type { PropertyMatchWithProperty } from "../types";

vi.mock("../repository", () => ({
  getMatchById: vi.fn(),
  getMatchByIdForTenant: vi.fn(),
  updateMatchStatus: vi.fn(),
  updateMatchStatusForTenant: vi.fn(),
  setLeaseDecision: vi.fn(),
  getMatchedPropertyIdsByTenantId: vi.fn(),
}));

vi.mock("@/features/viewings/repository", () => ({
  getViewingsByMatchId: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../notifications", () => ({
  sendNewInterestNotification: vi.fn(() => Promise.resolve()),
  sendMatchApprovedNotification: vi.fn(() => Promise.resolve()),
  sendMatchRejectedNotification: vi.fn(() => Promise.resolve()),
}));

// `service.ts` imports `getPublishedPropertiesList` for the match engine, which pulls in
// `server-only` — mock it out so this test file (run under Vitest's jsdom-ish environment)
// doesn't trip that guard, even though none of these tests exercise the engine itself.
vi.mock("@/features/properties/repository", () => ({
  getPublishedPropertiesList: vi.fn(),
}));

function buildMatch(
  overrides: Partial<PropertyMatchWithProperty> = {}
): PropertyMatchWithProperty {
  return {
    id: "match-1",
    propertyId: "prop-1",
    tenantId: "tenant-1",
    propertyOwnerId: "owner-1",
    initiatedBy: "system",
    status: "curated",
    notes: null,
    requestedMoveInDate: null,
    requestedMoveOutDate: null,
    matchScore: 80,
    curatedAt: "2026-09-01T00:00:00Z",
    leaseDecision: null,
    leaseDecisionAt: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    property: {
      id: "prop-1",
      title: "Test Listing",
      location: "Bangkok",
      monthlyRent: 18000,
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("expressInterest", () => {
  it("moves a curated match to interested", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "curated" })
    );
    vi.mocked(repository.updateMatchStatusForTenant).mockResolvedValue(
      buildMatch({ status: "interested" })
    );

    const result = await service.expressInterest("match-1", "tenant-1");

    expect(result.status).toBe("interested");
    expect(repository.updateMatchStatusForTenant).toHaveBeenCalledWith(
      "match-1",
      "tenant-1",
      "interested"
    );
  });

  it("rejects the transition when the match is not curated", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "approved" })
    );

    await expect(
      service.expressInterest("match-1", "tenant-1")
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(repository.updateMatchStatusForTenant).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when the match doesn't belong to the tenant", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(null);

    await expect(
      service.expressInterest("match-1", "tenant-1")
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("rejectMatch", () => {
  it.each(["curated", "interested"] as const)(
    "lets the tenant withdraw from a %s match",
    async (status) => {
      vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
        buildMatch({ status })
      );
      vi.mocked(repository.updateMatchStatusForTenant).mockResolvedValue(
        buildMatch({ status: "dismissed" })
      );

      const result = await service.rejectMatch("match-1", "tenant-1");
      expect(result.status).toBe("dismissed");
    }
  );

  it("lets the tenant withdraw from an approved match with no confirmed viewing", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "approved" })
    );
    vi.mocked(viewings.getViewingsByMatchId).mockResolvedValue([]);
    vi.mocked(repository.updateMatchStatusForTenant).mockResolvedValue(
      buildMatch({ status: "dismissed" })
    );

    const result = await service.rejectMatch("match-1", "tenant-1");
    expect(result.status).toBe("dismissed");
  });

  it("blocks withdrawing once a viewing has been confirmed", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "approved" })
    );
    vi.mocked(viewings.getViewingsByMatchId).mockResolvedValue([
      {
        id: "viewing-1",
        matchId: "match-1",
        status: "confirmed",
        scheduledAt: "2026-09-30T10:00:00Z",
        hostName: null,
        accessNotes: null,
        createdAt: "2026-09-20T00:00:00Z",
        updatedAt: "2026-09-20T00:00:00Z",
      },
    ]);

    await expect(
      service.rejectMatch("match-1", "tenant-1")
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(repository.updateMatchStatusForTenant).not.toHaveBeenCalled();
  });

  it.each(["dismissed", "rejected"] as const)(
    "refuses to re-close an already-closed match (%s)",
    async (status) => {
      vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
        buildMatch({ status })
      );

      await expect(
        service.rejectMatch("match-1", "tenant-1")
      ).rejects.toMatchObject({ code: "CONFLICT" });
    }
  );
});

describe("decideLease", () => {
  it("records a confirmed decision on an approved match", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "approved", leaseDecision: null })
    );
    vi.mocked(repository.setLeaseDecision).mockResolvedValue(
      buildMatch({ status: "approved", leaseDecision: "confirmed" })
    );

    const result = await service.decideLease(
      "match-1",
      "tenant-1",
      "confirmed"
    );
    expect(result.leaseDecision).toBe("confirmed");
  });

  it("rejects a lease decision on a match that isn't approved yet", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "interested" })
    );

    await expect(
      service.decideLease("match-1", "tenant-1", "confirmed")
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects a second decision once one is already final", async () => {
    vi.mocked(repository.getMatchByIdForTenant).mockResolvedValue(
      buildMatch({ status: "approved", leaseDecision: "confirmed" })
    );

    await expect(
      service.decideLease("match-1", "tenant-1", "declined")
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("updateMatchStatus (owner transitions)", () => {
  it("allows interested -> approved", async () => {
    vi.mocked(repository.getMatchById)
      .mockResolvedValueOnce(buildMatch({ status: "interested" }))
      .mockResolvedValueOnce(buildMatch({ status: "approved" }));
    vi.mocked(repository.updateMatchStatus).mockResolvedValue(
      buildMatch({ status: "approved" })
    );

    const result = await service.updateMatchStatus(
      "match-1",
      "approved",
      "owner-1"
    );
    expect(result.status).toBe("approved");
  });

  it("rejects curated -> approved (owners can't act before the tenant expresses interest)", async () => {
    vi.mocked(repository.getMatchById).mockResolvedValue(
      buildMatch({ status: "curated" })
    );

    await expect(
      service.updateMatchStatus("match-1", "approved", "owner-1")
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
