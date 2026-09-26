import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { completeContactMessage, getCompletedContactMessages } = vi.hoisted(
  () => ({
    completeContactMessage: vi.fn(),
    getCompletedContactMessages: vi.fn(),
  })
);

vi.mock("../service", () => ({
  completeContactMessage,
  getCompletedContactMessages,
}));

import {
  completeContactMessageAction,
  fetchCompletedContactMessagesAction,
} from "../actions";

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin actions — completeContactMessageAction", () => {
  it("returns an error for an empty resolution note without calling the service", async () => {
    const result = await completeContactMessageAction(VALID_ID, "   ");

    expect(result.errorMessage).toBeDefined();
    expect(completeContactMessage).not.toHaveBeenCalled();
  });

  it("returns success once the service call resolves", async () => {
    completeContactMessage.mockResolvedValue(undefined);

    const result = await completeContactMessageAction(
      VALID_ID,
      "Resolved via phone call"
    );

    expect(result).toEqual({ success: true });
    expect(completeContactMessage).toHaveBeenCalledWith(
      VALID_ID,
      "Resolved via phone call"
    );
  });

  it("surfaces an AppError message rather than throwing", async () => {
    const { AppError } = await import("@/lib/errors");
    completeContactMessage.mockRejectedValue(
      new AppError(
        "NOT_FOUND",
        "This message was not found or has already been completed"
      )
    );

    const result = await completeContactMessageAction(VALID_ID, "Resolved");

    expect(result.errorMessage).toBe(
      "This message was not found or has already been completed"
    );
  });

  it("returns a generic error message for an unexpected failure", async () => {
    completeContactMessage.mockRejectedValue(new Error("boom"));

    const result = await completeContactMessageAction(VALID_ID, "Resolved");

    expect(result.errorMessage).toBe(
      "Failed to complete this message. Please try again."
    );
  });
});

describe("admin actions — fetchCompletedContactMessagesAction", () => {
  it("returns the messages on success", async () => {
    getCompletedContactMessages.mockResolvedValue([]);

    const result = await fetchCompletedContactMessagesAction(
      "2026-01-01",
      "2026-02-01"
    );

    expect(result.messages).toEqual([]);
  });

  it("surfaces an AppError message for an over-wide range", async () => {
    const { AppError } = await import("@/lib/errors");
    getCompletedContactMessages.mockRejectedValue(
      new AppError(
        "VALIDATION_ERROR",
        "Completed messages can only be viewed in a window of up to 92 days"
      )
    );

    const result = await fetchCompletedContactMessagesAction(
      "2026-01-01",
      "2026-06-01"
    );

    expect(result.errorMessage).toBe(
      "Completed messages can only be viewed in a window of up to 92 days"
    );
  });
});
