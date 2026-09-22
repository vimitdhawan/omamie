import { describe, it, expect } from "vitest";
import {
  bathroomsSatisfy,
  bedroomsMatch,
  furnishingMatches,
  rankCandidates,
  scoreProperty,
} from "../utils";
import type { Property } from "@/features/properties/types";
import type { TenantRequirements } from "@/features/requirements/types";

function buildProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: "prop-1",
    profileId: "owner-1",
    title: "Test Listing",
    propertyType: "apartment",
    location: "Sukhumvit, Bangkok",
    locationId: null,
    locationDetails: null,
    monthlyRent: 18000,
    description: null,
    bedrooms: 1,
    bathrooms: 1,
    furnishedStatus: "furnished",
    securityDepositMonths: null,
    minimumLeaseMonths: null,
    condoId: null,
    condo: null,
    availableFrom: null,
    areaSqm: 40,
    floorNumber: null,
    totalFloors: null,
    amenities: [],
    images: [],
    status: "active",
    createdAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function buildRequirements(
  overrides: Partial<TenantRequirements> = {}
): TenantRequirements {
  return {
    profileId: "tenant-1",
    propertyType: "apartment",
    preferredLocation: "Sukhumvit",
    monthlyBudget: 20000,
    moveInDate: "2026-09-25",
    bedrooms: "1",
    bathrooms: "1",
    minSizeSqm: null,
    furnishing: "furnished",
    preferredNeighborhoods: [],
    petFriendly: false,
    parkingNeeded: false,
    amenitiesWishlist: [],
    additionalNotes: null,
    preferredLeaseLength: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("bedroomsMatch", () => {
  it.each([
    ["studio", 0, true],
    ["studio", 1, false],
    ["1", 1, true],
    ["1", 2, false],
    ["2", 2, true],
    ["3", 3, true],
    ["4+", 4, true],
    ["4+", 6, true],
    ["4+", 3, false],
  ] as const)(
    "bedrooms %s vs property %i -> %s",
    (requirement, actual, expected) => {
      expect(bedroomsMatch(requirement, actual)).toBe(expected);
    }
  );
});

describe("bathroomsSatisfy", () => {
  it.each([
    ["1", 1, true],
    ["1", 2, true],
    ["2", 1, false],
    ["2", 2, true],
    ["3+", 3, true],
    ["3+", 4, true],
    ["3+", 2, false],
  ] as const)(
    "bathrooms %s vs property %i -> %s",
    (requirement, actual, expected) => {
      expect(bathroomsSatisfy(requirement, actual)).toBe(expected);
    }
  );
});

describe("furnishingMatches", () => {
  it("maps the tenant's 'partially' onto the property's 'partial'", () => {
    expect(furnishingMatches("partially", "partial")).toBe(true);
  });

  it("matches furnished and unfurnished directly", () => {
    expect(furnishingMatches("furnished", "furnished")).toBe(true);
    expect(furnishingMatches("unfurnished", "unfurnished")).toBe(true);
  });

  it("does not match different furnishing levels", () => {
    expect(furnishingMatches("furnished", "unfurnished")).toBe(false);
  });

  it("does not match a null property furnished status", () => {
    expect(furnishingMatches("furnished", null)).toBe(false);
  });
});

describe("scoreProperty", () => {
  it("awards full score to a perfect match", () => {
    const property = buildProperty({ amenities: ["parking"] });
    const requirements = buildRequirements({ parkingNeeded: true });
    expect(scoreProperty(property, requirements)).toBe(100);
  });

  it("awards zero for a mismatch on every dimension", () => {
    const property = buildProperty({
      monthlyRent: 50000,
      bedrooms: 3,
      bathrooms: 1,
      location: "Chiang Mai",
      furnishedStatus: "unfurnished",
      areaSqm: 10,
      amenities: [],
    });
    const requirements = buildRequirements({
      monthlyBudget: 20000,
      bedrooms: "1",
      bathrooms: "2",
      preferredLocation: "Bangkok",
      furnishing: "furnished",
      minSizeSqm: 30,
      parkingNeeded: true,
    });
    expect(scoreProperty(property, requirements)).toBe(0);
  });

  it("only scores budget fit when rent is within budget", () => {
    const overBudget = buildProperty({ monthlyRent: 25000 });
    const withinBudget = buildProperty({ monthlyRent: 15000 });
    const requirements = buildRequirements({ monthlyBudget: 20000 });

    expect(scoreProperty(overBudget, requirements)).toBeLessThan(
      scoreProperty(withinBudget, requirements)
    );
  });

  it("does not penalize area when the tenant set no minimum size", () => {
    const property = buildProperty({ areaSqm: null });
    const requirements = buildRequirements({ minSizeSqm: null });
    // Every other dimension matches buildProperty()'s defaults, so a null minSizeSqm
    // should still award the full score.
    expect(scoreProperty(property, requirements)).toBe(100);
  });
});

describe("rankCandidates", () => {
  it("filters out anything below the curation threshold and caps the result", () => {
    const requirements = buildRequirements();
    const good = buildProperty({ id: "good" });
    const bad = buildProperty({
      id: "bad",
      monthlyRent: 999999,
      bedrooms: 5,
      bathrooms: 5,
      location: "Nowhere",
      furnishedStatus: "unfurnished",
    });

    const ranked = rankCandidates([bad, good], requirements);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].property.id).toBe("good");
  });

  it("sorts by score descending", () => {
    const requirements = buildRequirements();
    const highScore = buildProperty({ id: "high", amenities: [] });
    const midScore = buildProperty({
      id: "mid",
      furnishedStatus: "partial",
    });

    const ranked = rankCandidates([midScore, highScore], requirements);

    expect(ranked[0].property.id).toBe("high");
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });
});
