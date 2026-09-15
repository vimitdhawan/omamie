import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  deletePropertyAction: vi.fn(),
  getPropertiesListAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../actions", () => ({
  deletePropertyAction: mocks.deletePropertyAction,
  getPropertiesListAction: mocks.getPropertiesListAction,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt } = props as { src: string; alt: string };
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

import { PropertiesClient } from "../components/property-list/properties-client";
import type { Property } from "../types";

function buildProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: "7a0e0e5a-2b5f-4f7a-9f5e-2a6f2b0a1c33",
    profileId: "aa0e0e5a-2b5f-4f7a-9f5e-2a6f2b0a1c33",
    title: "Bright condo in Thonglor",
    description: null,
    propertyType: "condo",
    location: "Thonglor, Bangkok",
    monthlyRent: 45000,
    bedrooms: 2,
    bathrooms: 1,
    amenities: [],
    images: [],
    status: "draft",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  } as Property;
}

describe("Properties list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("drops the standalone Location column so the table fits its container", () => {
    render(<PropertiesClient initialProperties={[buildProperty()]} />);

    expect(
      screen.queryByRole("columnheader", { name: "Location" })
    ).not.toBeInTheDocument();
    // The location itself is still shown, folded under the property title.
    expect(screen.getByText("Thonglor, Bangkok")).toBeInTheDocument();
  });

  it("shows the listing essentials on a grid card", async () => {
    const user = userEvent.setup();
    render(
      <PropertiesClient
        initialProperties={[
          buildProperty({ areaSqm: 48, propertyType: "condo" }),
        ]}
      />
    );

    await user.click(screen.getByTitle("Grid view"));

    expect(screen.getByText("Bright condo in Thonglor")).toBeInTheDocument();
    expect(screen.getByText("Condo")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("PROP-1C33")).toBeInTheDocument();
    expect(screen.getByText("2 Bed")).toBeInTheDocument();
    expect(screen.getByText("1 Bath")).toBeInTheDocument();
    expect(screen.getByText("48 m\u00b2")).toBeInTheDocument();
    // Rent and its unit are split across two lines, as in the reference card.
    expect(screen.getByText("/ mo")).toBeInTheDocument();
    // Editing is reached through the title link or the actions menu, not a separate icon.
    expect(
      screen.getByRole("link", { name: "Bright condo in Thonglor" })
    ).toHaveAttribute(
      "href",
      "/properties/7a0e0e5a-2b5f-4f7a-9f5e-2a6f2b0a1c33/edit"
    );
    expect(
      screen.getByRole("button", {
        name: /actions for bright condo in thonglor/i,
      })
    ).toBeInTheDocument();
  });

  it("deletes a property only after the owner confirms", async () => {
    const user = userEvent.setup();
    mocks.deletePropertyAction.mockResolvedValue({ success: true });
    render(<PropertiesClient initialProperties={[buildProperty()]} />);

    await user.click(
      screen.getByRole("button", {
        name: /actions for bright condo in thonglor/i,
      })
    );
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    // Opening the confirmation must not delete anything on its own.
    expect(mocks.deletePropertyAction).not.toHaveBeenCalled();
    expect(screen.getByText(/delete this listing\?/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mocks.deletePropertyAction).toHaveBeenCalledWith(
        "7a0e0e5a-2b5f-4f7a-9f5e-2a6f2b0a1c33"
      );
    });
    // The list holds its rows in state, so the row has to be removed locally too.
    await waitFor(() => {
      expect(
        screen.queryByText("Bright condo in Thonglor")
      ).not.toBeInTheDocument();
    });
  });

  it("keeps the row when the delete fails", async () => {
    const user = userEvent.setup();
    mocks.deletePropertyAction.mockResolvedValue({
      errorMessage: "Failed to delete property. Please try again.",
    });
    render(<PropertiesClient initialProperties={[buildProperty()]} />);

    await user.click(
      screen.getByRole("button", {
        name: /actions for bright condo in thonglor/i,
      })
    );
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Failed to delete property. Please try again."
      );
    });
    expect(screen.getByText("Bright condo in Thonglor")).toBeInTheDocument();
  });
});
