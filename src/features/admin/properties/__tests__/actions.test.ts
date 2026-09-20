import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { approveProperty, rejectProperty } = vi.hoisted(() => ({
  approveProperty: vi.fn(),
  rejectProperty: vi.fn(),
}));

vi.mock("../service", () => ({ approveProperty, rejectProperty }));

import { approvePropertyAction, rejectPropertyAction } from "../actions";

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin actions — approvePropertyAction", () => {
  it("returns an error for a malformed property id without calling the service", async () => {
    const result = await approvePropertyAction("not-a-uuid");

    expect(result.errorMessage).toBeDefined();
    expect(approveProperty).not.toHaveBeenCalled();
  });

  it("returns success once the service call resolves", async () => {
    approveProperty.mockResolvedValue(undefined);

    const result = await approvePropertyAction(VALID_ID);

    expect(result).toEqual({ success: true });
    expect(approveProperty).toHaveBeenCalledWith(VALID_ID);
  });

  it("surfaces an AppError message rather than throwing", async () => {
    const { AppError } = await import("@/lib/errors");
    approveProperty.mockRejectedValue(
      new AppError("FORBIDDEN", "Admin access required")
    );

    const result = await approvePropertyAction(VALID_ID);

    expect(result.errorMessage).toBe("Admin access required");
  });
});

describe("admin actions — rejectPropertyAction", () => {
  it("returns success once the service call resolves", async () => {
    rejectProperty.mockResolvedValue(undefined);

    const result = await rejectPropertyAction(VALID_ID);

    expect(result).toEqual({ success: true });
    expect(rejectProperty).toHaveBeenCalledWith(VALID_ID);
  });

  it("returns a generic error message for an unexpected failure", async () => {
    rejectProperty.mockRejectedValue(new Error("boom"));

    const result = await rejectPropertyAction(VALID_ID);

    expect(result.errorMessage).toBe(
      "Failed to reject property. Please try again."
    );
  });
});
