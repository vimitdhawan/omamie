import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitFindPropertyRequest } from "../service";
import type { FindPropertyFormData } from "../schema";

const mockGetAuthSession = vi.hoisted(() => vi.fn());
const mockCreateFindPropertyRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-session", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("../repository", () => ({
  createFindPropertyRequest: mockCreateFindPropertyRequest,
}));

const formData: FindPropertyFormData = {
  propertyType: "apartment",
  preferredLocation: "Sukhumvit, Bangkok",
  monthlyBudget: 18000,
  moveInDate: "2026-09-01",
  bedrooms: "2",
  bathrooms: "1",
  minSizeSqm: 35,
  furnishing: "furnished",
};

describe("Find Property Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create the request using the session profileId", async () => {
    mockGetAuthSession.mockResolvedValue({
      profileId: "profile-1",
      role: "tenant",
    });
    mockCreateFindPropertyRequest.mockResolvedValue({
      id: "request-1",
      profileId: "profile-1",
      ...formData,
    });

    const result = await submitFindPropertyRequest(formData);

    expect(mockCreateFindPropertyRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "profile-1",
        propertyType: formData.propertyType,
        preferredLocation: formData.preferredLocation,
        monthlyBudget: formData.monthlyBudget,
        moveInDate: formData.moveInDate,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        minSizeSqm: formData.minSizeSqm,
        furnishing: formData.furnishing,
      })
    );
    expect(result.id).toBe("request-1");
  });

  it("should coerce a string monthlyBudget into a number", async () => {
    mockGetAuthSession.mockResolvedValue({
      profileId: "profile-1",
      role: "tenant",
    });
    mockCreateFindPropertyRequest.mockResolvedValue({ id: "request-1" });

    await submitFindPropertyRequest({
      ...formData,
      // FormData round-trips numbers as strings before zod coercion normally
      // runs; guard the service itself also coerces defensively.
      monthlyBudget: "18000" as unknown as number,
    });

    expect(mockCreateFindPropertyRequest).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyBudget: 18000 })
    );
  });

  it("should default an omitted minSizeSqm to null", async () => {
    mockGetAuthSession.mockResolvedValue({
      profileId: "profile-1",
      role: "tenant",
    });
    mockCreateFindPropertyRequest.mockResolvedValue({ id: "request-1" });

    const rest = { ...formData };
    delete (rest as Partial<FindPropertyFormData>).minSizeSqm;

    await submitFindPropertyRequest(rest as FindPropertyFormData);

    expect(mockCreateFindPropertyRequest).toHaveBeenCalledWith(
      expect.objectContaining({ minSizeSqm: null })
    );
  });

  it("should reject when there is no active session", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    await expect(submitFindPropertyRequest(formData)).rejects.toThrow();
    expect(mockCreateFindPropertyRequest).not.toHaveBeenCalled();
  });
});
