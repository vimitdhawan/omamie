import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabase, createClient } = vi.hoisted(() => {
  const fn = <T = unknown>() =>
    vi.fn() as unknown as ReturnType<typeof vi.fn> & T;
  const from = fn();
  const client = { from };
  return { supabase: client, createClient: vi.fn().mockResolvedValue(client) };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { submitContactMessage } from "../service";
import { createContactMessage as repoCreateContactMessage } from "../repository";

function setInsertChain(
  client: { from: ReturnType<typeof vi.fn> },
  resolved: { data: unknown; error: unknown }
) {
  const single = vi.fn().mockResolvedValue(resolved);
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = single;
  client.from.mockImplementation(() => chain);
  return { single, insert: chain.insert };
}

beforeEach(() => {
  vi.clearAllMocks();
  createClient.mockResolvedValue(supabase);
  setInsertChain(supabase, { data: null, error: null });
});

const validInput = {
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 000-0000",
  subject: "general" as const,
  message: "I would like to know more about your property listings.",
};

describe("contact service — submitContactMessage orchestration", () => {
  it("returns success when the repository insert succeeds", async () => {
    setInsertChain(supabase, {
      data: {
        id: "msg-1",
        full_name: "John Doe",
        email: "john@example.com",
        phone: "+1 (555) 000-0000",
        subject: "general",
        message: "I would like to know more about your property listings.",
        created_at: "2026-07-31T00:00:00Z",
      },
      error: null,
    });

    const result = await submitContactMessage(validInput);

    expect(result).toEqual({ success: true });
  });

  it("maps row-level security violation to a friendly message", async () => {
    setInsertChain(supabase, {
      data: null,
      error: {
        message:
          "new row violates row-level security policy for table contact_messages",
      },
    });

    const result = await submitContactMessage(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessage).toContain("Unable to submit your message");
    }
  });

  it("maps duplicate key error to a friendly message", async () => {
    setInsertChain(supabase, {
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    });

    const result = await submitContactMessage(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessage).toContain("already been submitted");
    }
  });

  it("passes through unmapped error messages verbatim", async () => {
    setInsertChain(supabase, {
      data: null,
      error: { message: "Some unexpected error" },
    });

    const result = await submitContactMessage(validInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessage).toBe("Some unexpected error");
    }
  });
});

describe("contact repository — createContactMessage direct call", () => {
  it("calls .from('contact_messages').insert(...).select().single()", async () => {
    const { single, insert } = setInsertChain(supabase, {
      data: { id: "msg-1" },
      error: null,
    });

    const { data, error } = await repoCreateContactMessage(validInput);

    expect(error).toBeNull();
    expect(data).toEqual({ id: "msg-1" });
    expect(supabase.from).toHaveBeenCalledWith("contact_messages");
    expect(insert).toHaveBeenCalledWith({
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 000-0000",
      subject: "general",
      message: "I would like to know more about your property listings.",
    });
    expect(single).toHaveBeenCalledTimes(1);
  });

  it("coerces an empty phone to null before inserting", async () => {
    const { insert } = setInsertChain(supabase, {
      data: { id: "msg-1" },
      error: null,
    });

    await repoCreateContactMessage({ ...validInput, phone: "" });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ phone: null })
    );
  });

  it("forwards the error when the insert fails", async () => {
    setInsertChain(supabase, {
      data: null,
      error: { message: "connection refused" },
    });

    const { data, error } = await repoCreateContactMessage(validInput);

    expect(data).toBeNull();
    expect(error).toEqual({ message: "connection refused" });
  });
});
