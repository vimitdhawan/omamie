import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockFile,
  createMockPropertyFormData,
} from "@/lib/__mocks__/test-utils";

const mocks = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
  savePropertyListing: vi.fn(),
  assertCanEditProperty: vi.fn(),
  listProperties: vi.fn(),
  deleteProperty: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({ getAuthSession: mocks.getAuthSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../service", () => ({
  savePropertyListing: mocks.savePropertyListing,
  assertCanEditProperty: mocks.assertCanEditProperty,
  listProperties: mocks.listProperties,
  deleteProperty: mocks.deleteProperty,
}));

import {
  savePropertyAction,
  deletePropertyAction,
  getPropertiesListAction,
} from "../actions";
import { PropertyValidationError } from "../errors";
import { AppError } from "@/lib/errors";

const OWNER_SESSION = { profileId: "u1", role: "owner" };
const PROPERTY_ID = "7e2c4a88-91bd-4f3c-8a12-6d0e5b7f3c41";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthSession.mockResolvedValue(OWNER_SESSION);
  mocks.savePropertyListing.mockResolvedValue({
    propertyId: PROPERTY_ID,
    status: "draft",
    imageWarnings: [],
  });
});

describe("savePropertyAction", () => {
  it("refuses an unauthenticated caller", async () => {
    mocks.getAuthSession.mockResolvedValue(null);

    const state = await savePropertyAction(null, createMockPropertyFormData());

    expect(state.errorMessage).toBe("Profile not found. Please log in again.");
    expect(mocks.savePropertyListing).not.toHaveBeenCalled();
  });

  it("refuses a tenant", async () => {
    mocks.getAuthSession.mockResolvedValue({ profileId: "u1", role: "tenant" });

    const state = await savePropertyAction(null, createMockPropertyFormData());

    expect(state.errorMessage).toContain("Only agents and owners");
    expect(mocks.savePropertyListing).not.toHaveBeenCalled();
  });

  it("saves a sparse draft", async () => {
    const state = await savePropertyAction(
      null,
      createMockPropertyFormData({ intent: "draft", fields: { title: "WIP" } })
    );

    expect(state.success).toBe(true);
    expect(state.status).toBe("draft");
    expect(state.created).toBe(true);
    expect(mocks.savePropertyListing).toHaveBeenCalledOnce();
  });

  it("reports validation failures as field errors", async () => {
    mocks.savePropertyListing.mockRejectedValue(
      new PropertyValidationError({ title: ["Property title is too short"] })
    );

    const state = await savePropertyAction(
      null,
      createMockPropertyFormData({ intent: "publish" })
    );

    expect(state.errors).toEqual({ title: ["Property title is too short"] });
    expect(state.success).toBeUndefined();
  });

  it("checks ownership before saving an existing listing", async () => {
    mocks.assertCanEditProperty.mockResolvedValue({
      id: PROPERTY_ID,
      profileId: "u1",
    });

    await savePropertyAction(
      null,
      createMockPropertyFormData({ propertyId: PROPERTY_ID })
    );

    expect(mocks.assertCanEditProperty).toHaveBeenCalledWith(PROPERTY_ID, "u1");
  });

  it("surfaces a forbidden edit and saves nothing", async () => {
    mocks.assertCanEditProperty.mockRejectedValue(
      new AppError(
        "FORBIDDEN",
        "You do not have permission to edit this property"
      )
    );

    const state = await savePropertyAction(
      null,
      createMockPropertyFormData({ propertyId: PROPERTY_ID })
    );

    expect(state.errorMessage).toBe(
      "You do not have permission to edit this property"
    );
    expect(mocks.savePropertyListing).not.toHaveBeenCalled();
  });

  it("does not leak an unexpected error's message", async () => {
    mocks.savePropertyListing.mockRejectedValue(
      new Error("connection string postgres://user:secret@host")
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const state = await savePropertyAction(null, createMockPropertyFormData());

    expect(state.errorMessage).toBe(
      "Failed to save property. Please try again."
    );
    expect(state.errorMessage).not.toContain("secret");
    consoleError.mockRestore();
  });

  it("passes image warnings through as a partial success", async () => {
    mocks.savePropertyListing.mockResolvedValue({
      propertyId: PROPERTY_ID,
      status: "draft",
      imageWarnings: [{ fileName: "b.jpg", message: "network blip" }],
    });

    const state = await savePropertyAction(
      null,
      createMockPropertyFormData({ files: [createMockFile()] })
    );

    // The listing saved, so this must not read as a failure.
    expect(state.success).toBe(true);
    expect(state.imageWarnings).toEqual([
      { fileName: "b.jpg", message: "network blip" },
    ]);
  });

  it("revalidates only after a successful save", async () => {
    await savePropertyAction(null, createMockPropertyFormData());
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/properties");

    mocks.revalidatePath.mockClear();
    mocks.savePropertyListing.mockRejectedValue(
      new AppError("INTERNAL_ERROR", "nope")
    );

    await savePropertyAction(null, createMockPropertyFormData());
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("marks an edit as not created, so the client keeps the URL", async () => {
    mocks.assertCanEditProperty.mockResolvedValue({
      id: PROPERTY_ID,
      profileId: "u1",
    });

    const state = await savePropertyAction(
      null,
      createMockPropertyFormData({ propertyId: PROPERTY_ID })
    );

    expect(state.created).toBe(false);
  });
});

describe("getPropertiesListAction", () => {
  it("reads the profile from the session, not from the caller", async () => {
    mocks.listProperties.mockResolvedValue([]);

    await getPropertiesListAction({ status: "draft" });

    expect(mocks.listProperties).toHaveBeenCalledWith("u1", {
      status: "draft",
    });
  });

  it("returns an empty list when signed out", async () => {
    mocks.getAuthSession.mockResolvedValue(null);

    expect(await getPropertiesListAction()).toEqual([]);
    expect(mocks.listProperties).not.toHaveBeenCalled();
  });
});

describe("deletePropertyAction", () => {
  it("checks ownership before deleting", async () => {
    mocks.assertCanEditProperty.mockResolvedValue({ id: PROPERTY_ID });

    const state = await deletePropertyAction(PROPERTY_ID);

    expect(mocks.assertCanEditProperty).toHaveBeenCalledWith(PROPERTY_ID, "u1");
    expect(mocks.deleteProperty).toHaveBeenCalledWith(PROPERTY_ID, "u1");
    expect(state.success).toBe(true);
  });

  it("does not delete when ownership check fails", async () => {
    mocks.assertCanEditProperty.mockRejectedValue(
      new AppError("FORBIDDEN", "not yours")
    );

    const state = await deletePropertyAction(PROPERTY_ID);

    expect(mocks.deleteProperty).not.toHaveBeenCalled();
    expect(state.errorMessage).toBe("not yours");
  });
});
