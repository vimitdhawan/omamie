import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdmin } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));

vi.mock("../../shared/auth", () => ({ requireAdmin }));

const { listContactMessages, markContactMessageCompleted } = vi.hoisted(() => ({
  listContactMessages: vi.fn(),
  markContactMessageCompleted: vi.fn(),
}));

vi.mock("../repository", () => ({
  listContactMessages,
  markContactMessageCompleted,
}));

import {
  getOpenContactMessages,
  getCompletedContactMessages,
  completeContactMessage,
} from "../service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin contact messages service — gated repository access", () => {
  it("getOpenContactMessages rejects when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("not admin"));

    await expect(getOpenContactMessages()).rejects.toThrow();
    expect(listContactMessages).not.toHaveBeenCalled();
  });

  it("getOpenContactMessages fetches open messages once requireAdmin resolves", async () => {
    requireAdmin.mockResolvedValue("admin-1");
    listContactMessages.mockResolvedValue([]);

    await getOpenContactMessages();

    expect(listContactMessages).toHaveBeenCalledWith({ status: "open" });
  });

  it("completeContactMessage passes the admin's profile id as resolvedBy", async () => {
    requireAdmin.mockResolvedValue("admin-1");

    await completeContactMessage("msg-1", "Resolved via phone call");

    expect(markContactMessageCompleted).toHaveBeenCalledWith(
      "msg-1",
      "Resolved via phone call",
      "admin-1"
    );
  });

  it("getCompletedContactMessages rejects a range wider than 92 days without hitting the repository", async () => {
    requireAdmin.mockResolvedValue("admin-1");

    await expect(
      getCompletedContactMessages("2026-01-01", "2026-06-01")
    ).rejects.toThrow();
    expect(listContactMessages).not.toHaveBeenCalled();
  });

  it("getCompletedContactMessages accepts a valid range", async () => {
    requireAdmin.mockResolvedValue("admin-1");
    listContactMessages.mockResolvedValue([]);

    await getCompletedContactMessages("2026-01-01", "2026-02-01");

    expect(listContactMessages).toHaveBeenCalledWith({
      status: "completed",
      from: "2026-01-01",
      to: "2026-02-01",
    });
  });
});
