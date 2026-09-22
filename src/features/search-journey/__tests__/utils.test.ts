import { describe, it, expect } from "vitest";
import {
  deriveMatchStage,
  deriveRequestCode,
  deriveStageCounts,
  getConfirmedViewing,
  getPendingProposals,
} from "../utils";
import type { PropertyMatch } from "@/features/property-matches/types";
import type { Viewing } from "@/features/viewings/types";

const NOW = new Date("2026-09-22T00:00:00Z");

function buildMatch(overrides: Partial<PropertyMatch> = {}): PropertyMatch {
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
    ...overrides,
  };
}

function buildViewing(overrides: Partial<Viewing> = {}): Viewing {
  return {
    id: "viewing-1",
    matchId: "match-1",
    status: "requested",
    scheduledAt: "2026-09-27T14:00:00Z",
    hostName: null,
    accessNotes: null,
    createdAt: "2026-09-10T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
    ...overrides,
  };
}

describe("deriveRequestCode", () => {
  it("takes the last 4 characters of the profile id, uppercased", () => {
    expect(deriveRequestCode("1c7488dd-b9fa-4986-96d1-f8d3a4736181")).toBe(
      "REQ-6181"
    );
  });
});

describe("getConfirmedViewing / getPendingProposals", () => {
  it("splits confirmed from still-pending proposals", () => {
    const viewings = [
      buildViewing({ id: "a", status: "requested" }),
      buildViewing({ id: "b", status: "confirmed" }),
      buildViewing({ id: "c", status: "cancelled" }),
    ];

    expect(getConfirmedViewing(viewings)?.id).toBe("b");
    expect(getPendingProposals(viewings).map((v) => v.id)).toEqual(["a"]);
  });
});

describe("deriveMatchStage", () => {
  it("is 'searching' for a curated suggestion", () => {
    expect(
      deriveMatchStage(buildMatch({ status: "curated" }), [], false, NOW)
    ).toBe("searching");
  });

  it("is 'matches' once the tenant has expressed interest", () => {
    expect(
      deriveMatchStage(buildMatch({ status: "interested" }), [], false, NOW)
    ).toBe("matches");
  });

  it.each(["rejected", "dismissed"] as const)(
    "is 'closed' when status is %s",
    (status) => {
      expect(deriveMatchStage(buildMatch({ status }), [], false, NOW)).toBe(
        "closed"
      );
    }
  );

  it("is 'viewing' when approved with no proposed times yet", () => {
    expect(
      deriveMatchStage(buildMatch({ status: "approved" }), [], false, NOW)
    ).toBe("viewing");
  });

  it("is 'viewing' when approved with pending (unconfirmed) proposals", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved" }),
        [buildViewing({ status: "requested" })],
        false,
        NOW
      )
    ).toBe("viewing");
  });

  it("is 'viewing' when a confirmed viewing is still in the future", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved" }),
        [
          buildViewing({
            status: "confirmed",
            scheduledAt: "2026-09-30T00:00:00Z",
          }),
        ],
        false,
        NOW
      )
    ).toBe("viewing");
  });

  it("is 'completed' once the confirmed viewing's date has passed", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved" }),
        [
          buildViewing({
            status: "confirmed",
            scheduledAt: "2026-09-10T00:00:00Z",
          }),
        ],
        false,
        NOW
      )
    ).toBe("completed");
  });

  it("is 'completed' once the lease decision is confirmed, even before the viewing date", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved", leaseDecision: "confirmed" }),
        [
          buildViewing({
            status: "confirmed",
            scheduledAt: "2026-09-30T00:00:00Z",
          }),
        ],
        false,
        NOW
      )
    ).toBe("completed");
  });

  it("is 'completed' when a lease row already exists, regardless of lease_decision", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved", leaseDecision: null }),
        [],
        true,
        NOW
      )
    ).toBe("completed");
  });

  it("is 'closed' when the lease decision is declined, even on an approved match", () => {
    expect(
      deriveMatchStage(
        buildMatch({ status: "approved", leaseDecision: "declined" }),
        [
          buildViewing({
            status: "confirmed",
            scheduledAt: "2026-09-10T00:00:00Z",
          }),
        ],
        false,
        NOW
      )
    ).toBe("closed");
  });
});

describe("deriveStageCounts", () => {
  it("counts matches per tab and excludes closed ones", () => {
    const counts = deriveStageCounts([
      "searching",
      "matches",
      "matches",
      "viewing",
      "completed",
      "closed",
    ]);

    expect(counts).toEqual({
      searching: 1,
      matches: 2,
      viewing: 1,
      completed: 1,
    });
  });

  it("is all zero with no matches", () => {
    expect(deriveStageCounts([])).toEqual({
      searching: 0,
      matches: 0,
      viewing: 0,
      completed: 0,
    });
  });
});
