import { beforeEach, describe, expect, it, vi } from "vitest";

// Build the Supabase mock client inline inside vi.hoisted so the vi.mock
// factory (which is itself hoisted above all imports) can reference it.
// Per AGENTS.md §7.3: repository tests mock `@/lib/supabase/server`'s
// `createClient` factory, never the repository module under test.
const { supabase, createClient } = vi.hoisted(() => {
  const fn = <T = unknown>() =>
    vi.fn() as unknown as ReturnType<typeof vi.fn> & T;
  const from = fn();
  const client = { from };
  return { supabase: client, createClient: vi.fn().mockResolvedValue(client) };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import {
  createProperty,
  getPropertyById,
  getPropertiesByOwner,
  updateProperty,
  deleteProperty,
} from "../repository";
import type { PropertyInsert } from "../types";

/**
 * Builds a chain on `supabase.from("properties")` that resolves to the
 * provided `{ data, error }` via `.single()`. Returns the mock terminator
 * function so tests can assert call counts.
 */
function setSingleChain(resolved: {
  data: unknown;
  error: unknown;
}): ReturnType<typeof vi.fn> {
  const singleMock = vi.fn().mockResolvedValue(resolved);
  const eqMock = vi.fn().mockReturnValue({ single: singleMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
  supabase.from.mockImplementation(() => ({ select: selectMock }));
  return singleMock;
}

/**
 * Builds the insert→select→single chain required by `createProperty` and
 * `updateProperty`. The transformed row resolves from `.single()`.
 */
function setInsertSingleChain(resolved: {
  data: unknown;
  error: unknown;
}): ReturnType<typeof vi.fn> {
  const singleMock = vi.fn().mockResolvedValue(resolved);
  const selectMock = vi.fn().mockReturnValue({ single: singleMock });
  const insertMock = vi.fn().mockReturnValue({ select: selectMock });
  supabase.from.mockImplementation(() => ({ insert: insertMock }));
  return singleMock;
}

function setUpdateSingleChain(resolved: {
  data: unknown;
  error: unknown;
}): ReturnType<typeof vi.fn> {
  const singleMock = vi.fn().mockResolvedValue(resolved);
  const selectMock = vi.fn().mockReturnValue({ single: singleMock });
  const eqMock = vi.fn().mockReturnValue({ select: selectMock });
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
  supabase.from.mockImplementation(() => ({ update: updateMock }));
  return singleMock;
}

function setDeleteChain(resolved: {
  error: unknown;
}): ReturnType<typeof vi.fn> {
  // repository calls: supabase.from("properties").delete().eq("id", id)
  // i.e. delete() returns a chain that has eq(), and eq() resolves to { error }
  const deleteMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue(resolved),
  });
  supabase.from.mockImplementation(() => ({ delete: deleteMock }));
  return deleteMock;
}

function setSelectListChain(resolved: {
  data: unknown;
  error: unknown;
}): ReturnType<typeof vi.fn> {
  const orderMock = vi.fn().mockResolvedValue(resolved);
  const eqMock = vi.fn().mockReturnValue({ order: orderMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
  supabase.from.mockImplementation(() => ({ select: selectMock }));
  return orderMock;
}

beforeEach(() => {
  vi.clearAllMocks();
  createClient.mockResolvedValue(supabase);
});

describe("properties repository — createProperty", () => {
  it("inserts a property and returns the created row", async () => {
    const inserted = { id: "p1", title: "Condo in Bangkok" };
    const singleMock = setInsertSingleChain({ data: inserted, error: null });

    const property: PropertyInsert = {
      owner_id: null,
      listing_role: "owner",
      title: "Condo in Bangkok",
      description: "",
      property_type: "condo",
      rent_amount: 25000,
      currency: "THB",
      address: "Sukhumvit",
      city: "",
      state: "",
      postal_code: "",
      country: "Thailand",
      bedrooms: 2,
      bathrooms: 2,
      furnishing: "fully",
      amenities: [],
      contact_name: "Ada",
      contact_email: "ada@example.com",
      contact_phone: "+66812345678",
      status: "pending",
    };

    const { data, error } = await createProperty(property);

    expect(error).toBeNull();
    expect(data).toEqual(inserted);
    expect(singleMock).toHaveBeenCalledTimes(1);
  });

  it("returns an Error when the insert fails", async () => {
    setInsertSingleChain({
      data: null,
      error: new Error("duplicate key violation"),
    });

    const { data, error } = await createProperty({} as PropertyInsert);

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("duplicate key violation");
  });
});

describe("properties repository — getPropertyById", () => {
  it("queries properties by id and returns the single row", async () => {
    const row = { id: "p1", title: "House on the hill" };
    setSingleChain({ data: row, error: null });

    const { data, error } = await getPropertyById("p1");

    expect(error).toBeNull();
    expect(data).toEqual(row);
    expect(supabase.from).toHaveBeenCalledWith("properties");
  });

  it("returns an Error and null data when the row is missing", async () => {
    setSingleChain({
      data: null,
      error: new Error("JSON object requested, multiple (or no) rows returned"),
    });

    const { data, error } = await getPropertyById("missing-id");

    expect(data).toBeNull();
    expect(error?.message).toBe(
      "JSON object requested, multiple (or no) rows returned"
    );
  });
});

describe("properties repository — getPropertiesByOwner", () => {
  it("returns an ordered array of properties for the owner", async () => {
    const rows = [{ id: "p1" }, { id: "p2" }];
    setSelectListChain({ data: rows, error: null });

    const { data, error } = await getPropertiesByOwner("u-owner");

    expect(error).toBeNull();
    expect(data).toEqual(rows);
  });

  it("returns null data and Error when the query fails", async () => {
    setSelectListChain({ data: null, error: new Error("no rows") });

    const { data, error } = await getPropertiesByOwner("u-owner");

    expect(data).toBeNull();
    expect(error?.message).toBe("no rows");
  });
});

describe("properties repository — updateProperty", () => {
  it("updates a property by id and returns the updated row", async () => {
    const updated = { id: "p1", title: "Updated Title" };
    setUpdateSingleChain({ data: updated, error: null });

    const updates = { title: "Updated Title" } as Partial<PropertyInsert>;

    const { data, error } = await updateProperty("p1", updates);

    expect(error).toBeNull();
    expect(data).toEqual(updated);
  });

  it("returns an Error when the update fails", async () => {
    setUpdateSingleChain({
      data: null,
      error: new Error("row level security policy"),
    });

    const { data, error } = await updateProperty(
      "p1",
      {} as Partial<PropertyInsert>
    );

    expect(data).toBeNull();
    expect(error?.message).toBe("row level security policy");
  });
});

describe("properties repository — deleteProperty", () => {
  it("returns no error on a successful delete", async () => {
    const deleteMock = setDeleteChain({ error: null });

    const { error } = await deleteProperty("p1");

    expect(error).toBeNull();
    expect(deleteMock).toHaveBeenCalledTimes(1);
  });

  it("returns an Error when the delete fails", async () => {
    setDeleteChain({ error: new Error("rls denied") });

    const { error } = await deleteProperty("p1");

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("rls denied");
  });
});
