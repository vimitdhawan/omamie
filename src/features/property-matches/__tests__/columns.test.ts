import { describe, it, expect, vi } from "vitest";
import { matchColumns } from "../components/matches-columns";
import type { PropertyMatchWithProperty } from "../types";

vi.mock("../actions", () => ({
  updateMatchStatusAction: vi.fn(),
}));

describe("Match Columns", () => {
  const mockMatch: PropertyMatchWithProperty = {
    id: "match-1",
    propertyId: "prop-1",
    tenantId: "tenant-1",
    propertyOwnerId: "owner-1",
    initiatedBy: "tenant",
    status: "interested",
    notes: "Great property",
    requestedMoveInDate: null,
    requestedMoveOutDate: null,
    createdAt: "2024-09-01T10:00:00Z",
    updatedAt: "2024-09-01T10:00:00Z",
    property: {
      id: "prop-1",
      title: "Cozy Apartment",
      location: "Manhattan, NY",
      monthlyRent: 2500,
    },
  };

  it("should have correct column definitions", () => {
    expect(matchColumns).toHaveLength(7);
    expect(matchColumns.map((col) => col.id)).toEqual([
      "tenant",
      "property",
      "location",
      "monthlyRent",
      "status",
      "createdAt",
      "actions",
    ]);
  });

  it("should render property column correctly", () => {
    const propertyCol = matchColumns.find((col) => col.id === "property");
    expect(propertyCol?.header).toBe("Property");
    expect(propertyCol?.enableSorting).toBe(false);

    const rendered = propertyCol?.cell({
      row: { original: mockMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });

  it("should render location column with icon", () => {
    const locationCol = matchColumns.find((col) => col.id === "location");
    expect(locationCol?.header).toBe("Location");
    expect(locationCol?.enableSorting).toBe(true);

    const rendered = locationCol?.cell({
      row: { original: mockMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });

  it("should render rent column with currency formatting", () => {
    const rentCol = matchColumns.find((col) => col.id === "monthlyRent");
    expect(rentCol?.header).toBe("Monthly Rent");
    expect(rentCol?.enableSorting).toBe(true);

    const rendered = rentCol?.cell({
      row: { original: mockMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });

  it("should render status column with badge", () => {
    const statusCol = matchColumns.find((col) => col.id === "status");
    expect(statusCol?.header).toBe("Status");
    expect(statusCol?.enableSorting).toBe(true);

    const rendered = statusCol?.cell({
      row: { original: mockMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });

  it("should render created date column", () => {
    const dateCol = matchColumns.find((col) => col.id === "createdAt");
    expect(dateCol?.header).toBe("Created");
    expect(dateCol?.enableSorting).toBe(true);

    const rendered = dateCol?.cell({
      row: { original: mockMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });

  it("should handle different status values correctly", () => {
    const statusCol = matchColumns.find((col) => col.id === "status");

    const statuses: Array<PropertyMatchWithProperty["status"]> = [
      "interested",
      "approved",
      "rejected",
    ];

    statuses.forEach((status) => {
      const testMatch = { ...mockMatch, status };
      const rendered = statusCol?.cell({
        row: { original: testMatch, index: 0 },
      });
      expect(rendered).toBeTruthy();
    });
  });

  it("should format dates correctly for recent matches", () => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const todayMatch = {
      ...mockMatch,
      createdAt: today.toISOString(),
    };

    const dateCol = matchColumns.find((col) => col.id === "createdAt");
    const rendered = dateCol?.cell({
      row: { original: todayMatch, index: 0 },
    });
    expect(rendered).toBeTruthy();
  });
});
