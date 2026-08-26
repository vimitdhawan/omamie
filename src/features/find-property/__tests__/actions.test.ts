import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleFindProperty } from "../actions";

const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockSubmitFindPropertyRequest = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("../service", () => ({
  submitFindPropertyRequest: mockSubmitFindPropertyRequest,
}));

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const defaults: Record<string, string> = {
    propertyType: "apartment",
    preferredLocation: "Sukhumvit, Bangkok",
    monthlyBudget: "18000",
    moveInDate: "2026-09-01",
    bedrooms: "2",
    bathrooms: "1",
    minSizeSqm: "35",
    furnishing: "furnished",
  };
  Object.entries({ ...defaults, ...overrides }).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

describe("handleFindProperty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns field errors for invalid form data without calling the service", async () => {
    const formData = buildFormData({ preferredLocation: "" });

    const result = await handleFindProperty(
      {} as Awaited<ReturnType<typeof handleFindProperty>>,
      formData
    );

    expect(result.errors?.preferredLocation).toBeDefined();
    expect(mockSubmitFindPropertyRequest).not.toHaveBeenCalled();
  });

  it("rejects the removed 'none' furnishing option", async () => {
    const formData = buildFormData({ furnishing: "none" });

    const result = await handleFindProperty(
      {} as Awaited<ReturnType<typeof handleFindProperty>>,
      formData
    );

    expect(result.errors?.furnishing).toBeDefined();
    expect(mockSubmitFindPropertyRequest).not.toHaveBeenCalled();
  });

  it("submits, revalidates, and returns success on valid data", async () => {
    mockSubmitFindPropertyRequest.mockResolvedValue({ id: "request-1" });
    const formData = buildFormData();

    const result = await handleFindProperty(
      {} as Awaited<ReturnType<typeof handleFindProperty>>,
      formData
    );

    expect(mockSubmitFindPropertyRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: "apartment",
        preferredLocation: "Sukhumvit, Bangkok",
        monthlyBudget: 18000,
        bedrooms: "2",
        bathrooms: "1",
        furnishing: "furnished",
      })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/find-property");
    expect(result).toEqual({ success: true });
  });

  it("returns a generic error message when the service throws", async () => {
    mockSubmitFindPropertyRequest.mockRejectedValue(new Error("db down"));
    const formData = buildFormData();

    const result = await handleFindProperty(
      {} as Awaited<ReturnType<typeof handleFindProperty>>,
      formData
    );

    expect(result.errorMessage).toBe(
      "Failed to submit request. Please try again."
    );
    expect(result.success).toBeUndefined();
  });
});
