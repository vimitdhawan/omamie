import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdmin } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));

vi.mock("../../shared/auth", () => ({ requireAdmin }));

const { findPropertiesForReview, updatePropertyStatus } = vi.hoisted(() => ({
  findPropertiesForReview: vi.fn(),
  updatePropertyStatus: vi.fn(),
}));

vi.mock("../repository", () => ({
  findPropertiesForReview,
  updatePropertyStatus,
  listAllProperties: vi.fn(),
}));

import { getReviewQueue, approveProperty, rejectProperty } from "../service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin properties service — gated repository access", () => {
  it("getReviewQueue rejects when requireAdmin rejects, without touching the repository", async () => {
    requireAdmin.mockRejectedValue(new Error("not admin"));

    await expect(getReviewQueue()).rejects.toThrow();
    expect(findPropertiesForReview).not.toHaveBeenCalled();
  });

  it("getReviewQueue calls the repository once requireAdmin resolves", async () => {
    requireAdmin.mockResolvedValue("admin-1");
    findPropertiesForReview.mockResolvedValue([]);

    await getReviewQueue();

    expect(findPropertiesForReview).toHaveBeenCalledTimes(1);
  });

  it("approveProperty sets status to active once requireAdmin resolves", async () => {
    requireAdmin.mockResolvedValue("admin-1");

    await approveProperty("prop-1");

    expect(updatePropertyStatus).toHaveBeenCalledWith("prop-1", "active");
  });

  it("rejectProperty sets status to inactive once requireAdmin resolves", async () => {
    requireAdmin.mockResolvedValue("admin-1");

    await rejectProperty("prop-1");

    expect(updatePropertyStatus).toHaveBeenCalledWith("prop-1", "inactive");
  });

  it("approveProperty rejects when requireAdmin rejects, without touching the repository", async () => {
    requireAdmin.mockRejectedValue(new Error("not admin"));

    await expect(approveProperty("prop-1")).rejects.toThrow();
    expect(updatePropertyStatus).not.toHaveBeenCalled();
  });
});
