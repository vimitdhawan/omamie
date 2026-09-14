import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockClient } from "@/lib/__mocks__/supabase";

const mocks = vi.hoisted(() => ({
  client: null as ReturnType<
    typeof import("@/lib/__mocks__/supabase").createMockClient
  > | null,
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import {
  savePropertyRpc,
  finalizePropertyImagesRpc,
  getPropertyById,
  getPropertiesCountByStatus,
  mapTableToProperty,
  escapeSearchTerm,
} from "../repository";
import { AppError } from "@/lib/errors";

function useClient(result?: {
  data: unknown;
  error: { code?: string; message?: string } | null;
  count?: number;
}) {
  const client = createMockClient(result);
  mocks.client = client;
  mocks.createClient.mockResolvedValue(client);
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("savePropertyRpc", () => {
  it("maps the domain input onto the function's snake_case arguments", async () => {
    const client = useClient();
    client.rpc.mockResolvedValue({
      data: {
        property_id: "p1",
        status: "draft",
        deleted_paths: [],
        pending: [],
      },
      error: null,
    });

    await savePropertyRpc({
      propertyId: "p1",
      isNew: true,
      property: { title: "A place" },
      location: { latitude: 1, longitude: 2 },
      images: [{ id: null, storage_path: "x.jpg", sort_order: 0 }],
      publish: false,
    });

    expect(client.rpc).toHaveBeenCalledWith("save_property", {
      p_property_id: "p1",
      p_is_new: true,
      p_property: { title: "A place" },
      p_location: { latitude: 1, longitude: 2 },
      p_images: [{ id: null, storage_path: "x.jpg", sort_order: 0 }],
      p_publish: false,
    });
  });

  it("turns the ownership guard's 42501 into a permission message", async () => {
    const client = useClient();
    client.rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "Property not found or not owned" },
    });

    await expect(
      savePropertyRpc({
        propertyId: "p1",
        isNew: false,
        property: {},
        location: null,
        images: [],
        publish: false,
      })
    ).rejects.toThrow("You don't have permission to edit this property.");
  });

  it("names a pending migration when the function is missing", async () => {
    const client = useClient();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    client.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "PGRST202",
        message: "Could not find the function public.save_property",
      },
    });

    await expect(
      savePropertyRpc({
        propertyId: "p1",
        isNew: true,
        property: {},
        location: null,
        images: [],
        publish: false,
      })
    ).rejects.toThrow(/pending migration/i);

    // The real code must reach the logs, or this failure is undiagnosable from the
    // user-facing message alone.
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("save_property"),
      expect.stringContaining("PGRST202")
    );
    consoleError.mockRestore();
  });

  it("raises an AppError rather than leaking a raw database error", async () => {
    const client = useClient();
    client.rpc.mockResolvedValue({
      data: null,
      error: { code: "XX000", message: "internal detail" },
    });

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const error = await savePropertyRpc({
      propertyId: "p1",
      isNew: false,
      property: {},
      location: null,
      images: [],
      publish: false,
    }).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Failed to save property");
    // Generic to the user, specific in the logs.
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("save_property"),
      expect.stringContaining("internal detail")
    );
    consoleError.mockRestore();
  });
});

describe("finalizePropertyImagesRpc", () => {
  it("passes the uploaded and failed id arrays through", async () => {
    const client = useClient();
    client.rpc.mockResolvedValue({
      data: { status: "review", failed_paths: [] },
      error: null,
    });

    const result = await finalizePropertyImagesRpc("p1", ["a"], ["b"], true);

    expect(client.rpc).toHaveBeenCalledWith("finalize_property_images", {
      p_property_id: "p1",
      p_uploaded: ["a"],
      p_failed: ["b"],
      p_publish: true,
    });
    expect(result.status).toBe("review");
  });
});

describe("getPropertyById", () => {
  it("requests the images embed alongside the property", async () => {
    const client = useClient({
      data: {
        id: "p1",
        profile_id: "u1",
        title: "A place",
        property_type: "condo",
        location: "Thonglor",
        monthly_rent: 45000,
        description: null,
        bedrooms: 2,
        bathrooms: 1,
        furnished_status: "furnished",
        amenities: ["ac"],
        status: "draft",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        property_images: [],
      },
      error: null,
    });

    await getPropertyById("p1");

    const select = client.__builder.select as ReturnType<typeof vi.fn>;
    expect(select.mock.calls[0][0]).toContain("property_images(");
    expect(select.mock.calls[0][0]).toContain("condos(");
  });

  it("returns null instead of throwing when the row is missing", async () => {
    useClient({ data: null, error: { code: "PGRST116", message: "no rows" } });

    expect(await getPropertyById("missing")).toBeNull();
  });
});

describe("mapTableToProperty", () => {
  const base = {
    id: "p1",
    profile_id: "u1",
    title: "A place",
    property_type: "condo",
    location: "Thonglor",
    monthly_rent: 45000,
    description: null,
    bedrooms: 2,
    bathrooms: 1,
    furnished_status: "furnished",
    amenities: ["ac"],
    security_deposit_months: 2,
    minimum_lease_months: 12,
    condo_id: "b1d2c3e4-5f60-4a7b-8c9d-0e1f2a3b4c5d",
    available_from: "2026-11-01",
    area_sqm: 85.5,
    floor_number: 18,
    total_floors: 34,
    status: "draft",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  } as never;

  it("hides images that are not uploaded yet", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_images: [
        { id: "i1", storage_path: "a.jpg", sort_order: 0, status: "uploaded" },
        { id: "i2", storage_path: "b.jpg", sort_order: 1, status: "pending" },
        { id: "i3", storage_path: "c.jpg", sort_order: 2, status: "failed" },
      ],
    } as never);

    expect(property.images.map((image) => image.id)).toEqual(["i1"]);
  });

  it("orders images by sort_order regardless of row order", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_images: [
        { id: "i2", storage_path: "b.jpg", sort_order: 1, status: "uploaded" },
        { id: "i1", storage_path: "a.jpg", sort_order: 0, status: "uploaded" },
      ],
    } as never);

    expect(property.images.map((image) => image.id)).toEqual(["i1", "i2"]);
  });

  it("tolerates a property with no images", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_images: null,
    } as never);

    expect(property.images).toEqual([]);
  });

  it("keeps draft nulls as nulls rather than coercing them", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_type: null,
      location: null,
      monthly_rent: null,
      furnished_status: null,
      security_deposit_months: null,
      available_from: null,
      area_sqm: null,
      floor_number: null,
      total_floors: null,
      property_images: [],
    } as never);

    expect(property.propertyType).toBeNull();
    expect(property.monthlyRent).toBeNull();
    expect(property.areaSqm).toBeNull();
    expect(property.availableFrom).toBeNull();
    expect(property.floorNumber).toBeNull();
  });

  it("maps the linked condo onto the domain model", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_images: [],
      condos: {
        id: "b1d2c3e4-5f60-4a7b-8c9d-0e1f2a3b4c5d",
        name: "The Estelle",
        facilities: ["pool", "gym"],
        verified: false,
      },
    } as never);

    expect(property.condo?.name).toBe("The Estelle");
    expect(property.condo?.facilities).toEqual(["pool", "gym"]);
    expect(property.minimumLeaseMonths).toBe(12);
  });

  it("reports no condo when the listing is not in one", () => {
    const property = mapTableToProperty({
      ...(base as object),
      condo_id: null,
      condos: null,
      property_images: [],
    } as never);

    expect(property.condo).toBeNull();
    expect(property.condoId).toBeNull();
  });

  it("maps the listing detail columns onto the domain model", () => {
    const property = mapTableToProperty({
      ...(base as object),
      property_images: [],
    } as never);

    expect(property.securityDepositMonths).toBe(2);
    expect(property.availableFrom).toBe("2026-11-01");
    expect(property.areaSqm).toBe(85.5);
    expect(property.floorNumber).toBe(18);
    expect(property.totalFloors).toBe(34);
  });

  it("reports null, not undefined, for columns a row is missing entirely", () => {
    const withoutArea = { ...(base as Record<string, unknown>) };
    delete withoutArea.area_sqm;

    const property = mapTableToProperty({
      ...withoutArea,
      property_images: [],
    } as never);

    // The domain type is `number | null`; undefined would leak through a `?? null` gap.
    expect(property.areaSqm).toBeNull();
  });
});

describe("getPropertiesCountByStatus", () => {
  it("counts drafts by status and never by the retired next_action column", async () => {
    const client = useClient({ data: null, error: null, count: 3 });

    const counts = await getPropertiesCountByStatus("u1");

    const eq = client.__builder.eq as ReturnType<typeof vi.fn>;
    const filtered = eq.mock.calls.map((call) => call[0]);
    expect(filtered).toContain("status");
    expect(filtered).not.toContain("next_action");
    expect(client.__builder.in).not.toHaveBeenCalled();
    expect(counts.draft).toBe(3);
  });
});

describe("escapeSearchTerm", () => {
  it("strips the characters that would inject extra PostgREST filters", () => {
    expect(escapeSearchTerm("thong,lor)*")).toBe("thonglor");
  });

  it("leaves an ordinary term alone", () => {
    expect(escapeSearchTerm("Thonglor")).toBe("Thonglor");
  });
});
