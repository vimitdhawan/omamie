import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabase, createServiceRoleClient } = vi.hoisted(() => {
  const fn = <T = unknown>() =>
    vi.fn() as unknown as ReturnType<typeof vi.fn> & T;
  const insert = fn();
  const from = fn().mockReturnValue({ insert });
  const client = { from };
  return {
    supabase: client,
    createServiceRoleClient: vi.fn().mockReturnValue(client),
  };
});

vi.mock("@/lib/supabase/server", () => ({ createServiceRoleClient }));

import { submitContactMessage } from "../service";
import { create as repoCreateContactMessage } from "../repository";
import type { ContactInput } from "../types";

function setInsertChain(
  client: { from: ReturnType<typeof vi.fn> },
  resolved: { error: unknown }
) {
  const insert = vi.fn().mockResolvedValue(resolved);
  client.from.mockImplementation(() => ({ insert }));
  return { insert };
}

const validInput: ContactInput = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 000-0000",
  subject: "general",
  message: "I would like to know more about your property listings.",
};

beforeEach(() => {
  vi.clearAllMocks();
  createServiceRoleClient.mockReturnValue(supabase);
  setInsertChain(supabase, { error: null });
});

describe("contact service — submitContactMessage orchestration", () => {
  it("returns void when the repository insert succeeds", async () => {
    const { insert } = setInsertChain(supabase, { error: null });

    await expect(submitContactMessage(validInput)).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith({
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 000-0000",
      subject: "general",
      message: "I would like to know more about your property listings.",
    });
  });

  it("propagates the AppError thrown by the repository on insert failure", async () => {
    setInsertChain(supabase, {
      error: { message: "connection refused" },
    });

    await expect(submitContactMessage(validInput)).rejects.toSatisfy(
      (err: unknown) => {
        if (!(err instanceof Error)) return false;
        return (
          err.name === "AppError" &&
          err.message.includes("Failed to create contact message")
        );
      }
    );
  });
});

describe("contact repository — create direct call", () => {
  it("calls .from('contact_messages').insert(...) with mapped snake_case fields", async () => {
    const { insert } = setInsertChain(supabase, { error: null });

    await repoCreateContactMessage(validInput);

    expect(supabase.from).toHaveBeenCalledWith("contact_messages");
    expect(insert).toHaveBeenCalledWith({
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 000-0000",
      subject: "general",
      message: "I would like to know more about your property listings.",
    });
  });

  it("coerces a null phone to null before inserting", async () => {
    const { insert } = setInsertChain(supabase, { error: null });

    await repoCreateContactMessage({ ...validInput, phone: null });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ phone: null })
    );
  });

  it("throws AppError(INTERNAL_ERROR) when the insert fails", async () => {
    setInsertChain(supabase, {
      error: { message: "connection refused" },
    });

    await expect(repoCreateContactMessage(validInput)).rejects.toSatisfy(
      (err: unknown) => {
        if (!(err instanceof Error)) return false;
        return (
          err.name === "AppError" &&
          err.message.includes("Failed to create contact message")
        );
      }
    );
  });
});
