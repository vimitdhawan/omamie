import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockFile } from "@/lib/__mocks__/test-utils";

const mocks = vi.hoisted(() => ({
  savePropertyRpc: vi.fn(),
  finalizePropertyImagesRpc: vi.fn(),
  listImagePathsForProperty: vi.fn(),
  getPropertyById: vi.fn(),
  getPropertiesList: vi.fn(),
  getPropertiesCountByStatus: vi.fn(),
  deletePropertyById: vi.fn(),
  uploadPropertyImage: vi.fn(),
  deleteImagePaths: vi.fn(),
  listImageObjects: vi.fn(),
}));

vi.mock("../repository", () => ({
  savePropertyRpc: mocks.savePropertyRpc,
  finalizePropertyImagesRpc: mocks.finalizePropertyImagesRpc,
  listImagePathsForProperty: mocks.listImagePathsForProperty,
  getPropertyById: mocks.getPropertyById,
  getPropertiesList: mocks.getPropertiesList,
  getPropertiesCountByStatus: mocks.getPropertiesCountByStatus,
  deletePropertyById: mocks.deletePropertyById,
}));

vi.mock("../storage", () => ({
  buildImagePath: (profileId: string, propertyId: string, fileName: string) =>
    `${profileId}/${propertyId}/generated-${fileName}`,
  uploadPropertyImage: mocks.uploadPropertyImage,
  deleteImagePaths: mocks.deleteImagePaths,
  listImageObjects: mocks.listImageObjects,
}));

import { savePropertyListing, PropertyValidationError } from "../service";

const PROFILE_ID = "5d9a1f10-3c2b-4e6a-8f11-2b7c9d4e5a60";
const PROPERTY_ID = "7e2c4a88-91bd-4f3c-8a12-6d0e5b7f3c41";

type RpcInput = {
  propertyId: string;
  isNew: boolean;
  property: Record<string, unknown>;
  images: Array<{
    id: string | null;
    storage_path: string | null;
    sort_order: number;
  }>;
  publish: boolean;
};

/**
 * Mirrors what the function actually does: echo the id it was given and hand back a row for
 * every new image, so the service's path bookkeeping is exercised rather than bypassed.
 */
function mockRpcEcho(overrides: Record<string, unknown> = {}) {
  mocks.savePropertyRpc.mockImplementation(async (input: RpcInput) => ({
    property_id: input.propertyId,
    location_id: null,
    status: "draft",
    deleted_paths: [],
    pending: input.images
      .filter((image) => image.id === null)
      .map((image, index) => ({
        id: `a${index + 1}`,
        storage_path: image.storage_path!,
        sort_order: image.sort_order,
      })),
    ...overrides,
  }));
}

const existingProperty = {
  id: PROPERTY_ID,
  profileId: PROFILE_ID,
  title: "Existing",
  images: [],
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listImagePathsForProperty.mockResolvedValue([]);
  mocks.listImageObjects.mockResolvedValue([]);
  mocks.deleteImagePaths.mockResolvedValue(undefined);
  mocks.uploadPropertyImage.mockResolvedValue(undefined);
  mocks.finalizePropertyImagesRpc.mockResolvedValue({
    status: "draft",
    failed_paths: [],
  });
});

describe("savePropertyListing", () => {
  it("commits the transaction before uploading anything", async () => {
    const order: string[] = [];
    mockRpcEcho();
    const inner = mocks.savePropertyRpc.getMockImplementation()!;
    mocks.savePropertyRpc.mockImplementation(async (input: RpcInput) => {
      order.push("rpc");
      return inner(input);
    });
    mocks.uploadPropertyImage.mockImplementation(async () => {
      order.push("upload");
    });
    mocks.finalizePropertyImagesRpc.mockImplementation(async () => {
      order.push("finalize");
      return { status: "draft", failed_paths: [] };
    });

    await savePropertyListing(
      {
        intent: "draft",
        title: "A place",
        images: JSON.stringify([{ id: null, fileIndex: 0, sortOrder: 0 }]),
      },
      [createMockFile("a.jpg", "image/jpeg", 100)],
      PROFILE_ID,
      null
    );

    expect(order).toEqual(["rpc", "upload", "finalize"]);
  });

  it("creates with a generated id and marks the call as new", async () => {
    mockRpcEcho();

    const result = await savePropertyListing(
      { intent: "draft", title: "A place" },
      [],
      PROFILE_ID,
      null
    );

    const call = mocks.savePropertyRpc.mock.calls[0][0];
    expect(call.isNew).toBe(true);
    expect(call.propertyId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.propertyId).toBe(call.propertyId);
    expect(result.imageWarnings).toEqual([]);
  });

  it("skips finalize entirely when publishing with no new files", async () => {
    mockRpcEcho({ status: "review", pending: [] });

    const result = await savePropertyListing(
      {
        intent: "publish",
        propertyType: "condo",
        title: "Bright two bedroom near BTS",
        location: "Thonglor",
        latitude: "13.73",
        longitude: "100.56",
        monthlyRent: "45000",
        bedrooms: "2",
        bathrooms: "1",
        furnishedStatus: "furnished",
        areaSqm: "85",
        acceptTerms: "on",
        confirmAccuracy: "on",
        images: JSON.stringify([
          {
            id: "3f1b9c2e-6a4d-4b8e-9f27-1c5ad0e7b912",
            fileIndex: null,
            sortOrder: 0,
          },
        ]),
      },
      [],
      PROFILE_ID,
      existingProperty
    );

    // The RPC already published, so there is nothing left to promote.
    expect(mocks.finalizePropertyImagesRpc).not.toHaveBeenCalled();
    expect(result.status).toBe("review");
  });

  it("leaves a publish with new files as a draft until finalize promotes it", async () => {
    mockRpcEcho();
    mocks.finalizePropertyImagesRpc.mockResolvedValue({
      status: "review",
      failed_paths: [],
    });

    const result = await savePropertyListing(
      {
        intent: "publish",
        propertyType: "condo",
        title: "Bright two bedroom near BTS",
        location: "Thonglor",
        latitude: "13.73",
        longitude: "100.56",
        monthlyRent: "45000",
        bedrooms: "2",
        bathrooms: "1",
        furnishedStatus: "furnished",
        areaSqm: "85",
        acceptTerms: "on",
        confirmAccuracy: "on",
        images: JSON.stringify([{ id: null, fileIndex: 0, sortOrder: 0 }]),
      },
      [createMockFile("a.jpg", "image/jpeg", 100)],
      PROFILE_ID,
      existingProperty
    );

    const savedId = mocks.savePropertyRpc.mock.calls[0][0].propertyId;
    expect(mocks.savePropertyRpc.mock.calls[0][0].publish).toBe(true);
    expect(mocks.finalizePropertyImagesRpc).toHaveBeenCalledWith(
      savedId,
      ["a1"],
      [],
      true
    );
    expect(result.status).toBe("review");
  });

  it("touches no storage when the transaction fails", async () => {
    mocks.savePropertyRpc.mockRejectedValue(new Error("db down"));

    await expect(
      savePropertyListing(
        {
          intent: "draft",
          title: "A place",
          images: JSON.stringify([{ id: null, fileIndex: 0, sortOrder: 0 }]),
        },
        [createMockFile("a.jpg", "image/jpeg", 100)],
        PROFILE_ID,
        null
      )
    ).rejects.toThrow("db down");

    expect(mocks.uploadPropertyImage).not.toHaveBeenCalled();
    expect(mocks.deleteImagePaths).not.toHaveBeenCalled();
    expect(mocks.finalizePropertyImagesRpc).not.toHaveBeenCalled();
  });

  it("keeps the property when one image of three fails to upload", async () => {
    mockRpcEcho();
    mocks.uploadPropertyImage.mockImplementation(async (path: string) => {
      if (path.endsWith("generated-b.jpg")) throw new Error("network blip");
    });
    mocks.finalizePropertyImagesRpc.mockResolvedValue({
      status: "draft",
      failed_paths: ["b.jpg"],
    });

    const result = await savePropertyListing(
      {
        intent: "draft",
        title: "A place",
        images: JSON.stringify([
          { id: null, fileIndex: 0, sortOrder: 0 },
          { id: null, fileIndex: 1, sortOrder: 1 },
          { id: null, fileIndex: 2, sortOrder: 2 },
        ]),
      },
      [
        createMockFile("a.jpg", "image/jpeg", 100),
        createMockFile("b.jpg", "image/jpeg", 100),
        createMockFile("c.jpg", "image/jpeg", 100),
      ],
      PROFILE_ID,
      null
    );

    const savedId = mocks.savePropertyRpc.mock.calls[0][0].propertyId;
    expect(mocks.finalizePropertyImagesRpc).toHaveBeenCalledWith(
      savedId,
      ["a1", "a3"],
      ["a2"],
      false
    );
    expect(result.imageWarnings).toEqual([
      { fileName: "b.jpg", message: "network blip" },
    ]);
    // The listing itself still saved: a bad photo must not lose the owner's typed work.
    expect(result.propertyId).toBe(savedId);
  });

  it("deletes storage objects for images removed in this save", async () => {
    mockRpcEcho({ deleted_paths: ["old/one.jpg", "old/two.jpg"] });

    await savePropertyListing(
      { intent: "draft", title: "A place" },
      [],
      PROFILE_ID,
      existingProperty
    );

    expect(mocks.deleteImagePaths).toHaveBeenCalledWith([
      "old/one.jpg",
      "old/two.jpg",
    ]);
  });

  it("sweeps an old orphan but spares a recent one", async () => {
    mockRpcEcho({ deleted_paths: ["stale.jpg"] });
    mocks.listImagePathsForProperty.mockResolvedValue(["live.jpg"]);
    mocks.listImageObjects.mockResolvedValue([
      { name: "live.jpg", createdAt: new Date(0).toISOString() },
      { name: "old-orphan.jpg", createdAt: new Date(0).toISOString() },
      { name: "fresh-orphan.jpg", createdAt: new Date().toISOString() },
    ]);

    await savePropertyListing(
      { intent: "draft", title: "A place" },
      [],
      PROFILE_ID,
      existingProperty
    );

    // A just-uploaded object may belong to a concurrent save whose rows have not committed.
    expect(mocks.deleteImagePaths).toHaveBeenLastCalledWith(["old-orphan.jpg"]);
  });

  it("still succeeds when the sweep throws", async () => {
    mockRpcEcho({ deleted_paths: ["stale.jpg"] });
    mocks.deleteImagePaths.mockRejectedValue(new Error("storage unavailable"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await savePropertyListing(
      { intent: "draft", title: "A place" },
      [],
      PROFILE_ID,
      existingProperty
    );

    expect(result.propertyId).toBe(PROPERTY_ID);
    expect(consoleError).toHaveBeenCalled();
    mocks.deleteImagePaths.mockResolvedValue(undefined);
    consoleError.mockRestore();
  });

  it("passes the manifest order through to the RPC unchanged", async () => {
    mockRpcEcho();
    const keptA = "3f1b9c2e-6a4d-4b8e-9f27-1c5ad0e7b912";
    const keptB = "8c4d2e71-5b3a-4c9d-b1e6-7f2a3d5c8e04";

    await savePropertyListing(
      {
        intent: "draft",
        title: "A place",
        images: JSON.stringify([
          { id: keptB, fileIndex: null, sortOrder: 0 },
          { id: keptA, fileIndex: null, sortOrder: 1 },
        ]),
      },
      [],
      PROFILE_ID,
      existingProperty
    );

    expect(mocks.savePropertyRpc.mock.calls[0][0].images).toEqual([
      { id: keptB, storage_path: null, sort_order: 0 },
      { id: keptA, storage_path: null, sort_order: 1 },
    ]);
  });

  it("rejects an oversized image before writing anything", async () => {
    await expect(
      savePropertyListing(
        {
          intent: "draft",
          title: "A place",
          images: JSON.stringify([{ id: null, fileIndex: 0, sortOrder: 0 }]),
        },
        [createMockFile("big.jpg", "image/jpeg", 6 * 1024 * 1024)],
        PROFILE_ID,
        null
      )
    ).rejects.toBeInstanceOf(PropertyValidationError);

    expect(mocks.savePropertyRpc).not.toHaveBeenCalled();
  });

  it("only sends fields the form carried, so a partial draft keeps saved values", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", title: "Renamed" },
      [],
      PROFILE_ID,
      existingProperty
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    expect(payload.title).toBe("Renamed");
    expect(payload).not.toHaveProperty("monthly_rent");
    expect(payload).not.toHaveProperty("location");
  });

  it("sends every column on create, so defaults are explicit", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", title: "New" },
      [],
      PROFILE_ID,
      null
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    for (const column of [
      "monthly_rent",
      "furnished_status",
      "security_deposit_months",
      "available_from",
      "area_sqm",
      "floor_number",
      "total_floors",
    ]) {
      expect(payload).toHaveProperty(column, null);
    }
  });

  it("maps the listing detail fields onto their columns", async () => {
    mockRpcEcho();

    await savePropertyListing(
      {
        intent: "draft",
        title: "A place",
        securityDepositMonths: "2",
        availableFrom: "2026-11-01",
        areaSqm: "85.5",
        floorNumber: "18",
        totalFloors: "34",
      },
      [],
      PROFILE_ID,
      existingProperty
    );

    expect(mocks.savePropertyRpc.mock.calls[0][0].property).toMatchObject({
      security_deposit_months: 2,
      // Passed through as the raw ISO string: turning it into a Date would reapply a
      // timezone and could shift the day.
      available_from: "2026-11-01",
      area_sqm: 85.5,
      floor_number: 18,
      total_floors: 34,
    });
  });

  it("sends the building name and its facilities to the condo registry", async () => {
    mockRpcEcho();

    await savePropertyListing(
      {
        intent: "draft",
        title: "A place",
        buildingName: "  The Estelle  ",
        amenities: ["ac", "pool", "wifi", "gym"],
      },
      [],
      PROFILE_ID,
      existingProperty
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    expect(payload.condo_name).toBe("The Estelle");
    // Only the building half seeds the registry...
    expect(payload.condo_facilities).toEqual(["pool", "gym"]);
    // ...while the property still records everything, so it describes itself with or
    // without a condo linked.
    expect(payload.amenities).toEqual(["ac", "pool", "wifi", "gym"]);
  });

  it("unlinks the condo when the building name is blanked", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", buildingName: "   ", amenities: ["pool"] },
      [],
      PROFILE_ID,
      existingProperty
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    expect(payload.condo_name).toBeNull();
    // No facilities are sent for an unlinked listing; there is no row to seed.
    expect(payload).not.toHaveProperty("condo_facilities");
  });

  it("leaves the condo alone when the form did not carry a building name", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", title: "Renamed" },
      [],
      PROFILE_ID,
      existingProperty
    );

    // Omitting the key is what stops a partial save unlinking the building.
    expect(mocks.savePropertyRpc.mock.calls[0][0].property).not.toHaveProperty(
      "condo_name"
    );
  });

  it("persists the minimum lease term", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", minimumLeaseMonths: "12" },
      [],
      PROFILE_ID,
      existingProperty
    );

    expect(mocks.savePropertyRpc.mock.calls[0][0].property).toHaveProperty(
      "minimum_lease_months",
      12
    );
  });

  it("sends an explicit null for a cleared field, not a missing key", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", title: "A place", areaSqm: null },
      [],
      PROFILE_ID,
      existingProperty
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    // An omitted key makes save_property preserve the stored value, so clearing has to
    // travel as a null or the field could never be emptied.
    expect(payload).toHaveProperty("area_sqm", null);
  });

  it("leaves untouched detail fields out of a partial save", async () => {
    mockRpcEcho();

    await savePropertyListing(
      { intent: "draft", title: "Renamed" },
      [],
      PROFILE_ID,
      existingProperty
    );

    const payload = mocks.savePropertyRpc.mock.calls[0][0].property;
    expect(payload).not.toHaveProperty("area_sqm");
    expect(payload).not.toHaveProperty("available_from");
  });
});
