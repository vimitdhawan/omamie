import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  handleSaveRequirements: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("../actions", () => ({
  handleSaveRequirements: mocks.handleSaveRequirements,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { RequirementsEditDrawer } from "../components/requirements-edit-drawer";
import type { TenantProfile, TenantRequirements } from "../types";

const PROFILE: TenantProfile = {
  profileId: "tenant-1",
  firstName: "Vimit",
  occupation: "Software Engineer",
  employer: "Delivery Hero",
  reasonForMoving: "Relocating for new job",
  intendedDuration: "1_year",
  numberOfOccupants: 2,
  hasPets: true,
  isSmoker: true,
  bio: null,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

const REQUIREMENTS: TenantRequirements = {
  profileId: "tenant-1",
  propertyType: "apartment",
  preferredLocation: "Bangkok",
  monthlyBudget: 20000,
  moveInDate: "2026-09-25",
  bedrooms: "1",
  bathrooms: "2",
  minSizeSqm: null,
  furnishing: "furnished",
  preferredNeighborhoods: [],
  petFriendly: false,
  parkingNeeded: false,
  amenitiesWishlist: [],
  additionalNotes: null,
  preferredLeaseLength: null,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RequirementsEditDrawer", () => {
  it("prefills all three sections from the given profile and requirements", () => {
    render(
      <RequirementsEditDrawer
        profile={PROFILE}
        requirements={REQUIREMENTS}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText("About you")).toBeInTheDocument();
    expect(screen.getByText("What you're looking for")).toBeInTheDocument();
    expect(screen.getByText("Additional Preferences")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Vimit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bangkok")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20000")).toBeInTheDocument();
  });

  it("closes without saving when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <RequirementsEditDrawer
        profile={PROFILE}
        requirements={REQUIREMENTS}
        open
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mocks.handleSaveRequirements).not.toHaveBeenCalled();
  });

  it("closes the drawer and refreshes the page on a successful save", async () => {
    mocks.handleSaveRequirements.mockResolvedValue({ success: true });
    const onOpenChange = vi.fn();

    render(
      <RequirementsEditDrawer
        profile={PROFILE}
        requirements={REQUIREMENTS}
        open
        onOpenChange={onOpenChange}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });
});
