import { describe, it, expect } from "vitest";
import {
  completeContactMessageSchema,
  completedRangeSchema,
  MAX_COMPLETED_RANGE_DAYS,
} from "../schema";

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("completeContactMessageSchema", () => {
  it("rejects an empty resolution note", () => {
    const result = completeContactMessageSchema.safeParse({
      id: "3b3c2b3e-7f9b-4a6a-8f1e-8a2b1a1f0a11",
      resolutionNote: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid resolution note", () => {
    const result = completeContactMessageSchema.safeParse({
      id: "3b3c2b3e-7f9b-4a6a-8f1e-8a2b1a1f0a11",
      resolutionNote: "Called the customer and resolved the issue.",
    });
    expect(result.success).toBe(true);
  });
});

describe("completedRangeSchema", () => {
  it("rejects a range wider than 92 days", () => {
    const from = "2026-01-01";
    const to = addDays(from, MAX_COMPLETED_RANGE_DAYS + 1);

    const result = completedRangeSchema.safeParse({ from, to });
    expect(result.success).toBe(false);
  });

  it("accepts a range at exactly the 92-day boundary", () => {
    const from = "2026-01-01";
    const to = addDays(from, MAX_COMPLETED_RANGE_DAYS);

    const result = completedRangeSchema.safeParse({ from, to });
    expect(result.success).toBe(true);
  });

  it("rejects a range where the start date is after the end date", () => {
    const result = completedRangeSchema.safeParse({
      from: "2026-02-01",
      to: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });
});
