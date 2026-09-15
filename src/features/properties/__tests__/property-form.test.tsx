import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const SUGGESTION = {
  place_id: "thonglor",
  place_name: "Thonglor, Bangkok, Thailand",
  center: [100.5698, 13.7308] as [number, number],
  context: [{ id: "place.1", text: "Bangkok" }],
};

const mocks = vi.hoisted(() => ({
  savePropertyAction: vi.fn(),
  fetchLocationSuggestionsAction: vi.fn(),
  fetchLocationEnrichmentAction: vi.fn(() => Promise.resolve({})),
}));

vi.mock("../actions", () => ({
  savePropertyAction: mocks.savePropertyAction,
  fetchLocationSuggestionsAction: mocks.fetchLocationSuggestionsAction,
  fetchLocationEnrichmentAction: mocks.fetchLocationEnrichmentAction,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// next/image needs a plain img in jsdom.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt } = props as { src: string; alt: string };
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

import { PropertyForm } from "../components/property-form/property-form";
import { toast } from "sonner";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.savePropertyAction.mockResolvedValue({
    success: true,
    status: "draft",
  });
  mocks.fetchLocationSuggestionsAction.mockResolvedValue([SUGGESTION]);
});

/** Fills everything the basics section needs, including picking a neighbourhood. */
async function completeBasics(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Condo" }));
  await user.type(await screen.findByLabelText(/monthly rent/i), "45000");

  await user.type(screen.getByLabelText(/neighbourhood/i), "Thonglor");
  // Selecting a suggestion is what supplies the coordinates a listing needs; typing the
  // name alone leaves the listing without a pin.
  await user.click(await screen.findByRole("button", { name: /Thonglor/ }));
}

function openSection(
  user: ReturnType<typeof userEvent.setup>,
  section: string
) {
  return user.click(screen.getByRole("button", { name: `Edit ${section}` }));
}

const openBasics = (user: ReturnType<typeof userEvent.setup>) =>
  openSection(user, "Property Basics & Rental Terms");
const openHeadline = (user: ReturnType<typeof userEvent.setup>) =>
  openSection(user, "Headline & Description");

describe("PropertyForm", () => {
  it("shows all five sections with an empty state before anything is filled in", () => {
    render(<PropertyForm />);

    for (const section of [
      "Property Basics & Rental Terms",
      "Bedrooms, Bathrooms & Specs",
      "Property Photos",
      "Amenities & Building Highlights",
      "Headline & Description",
    ]) {
      expect(
        screen.getByRole("button", { name: `Edit ${section}` })
      ).toBeInTheDocument();
    }
    // Specs is not in the list: bedrooms and bathrooms default to 1, so it always
    // has a summary line to show.
    expect(screen.getAllByText("Nothing filled in yet.").length).toBe(4);
  });

  it("reports readiness in the publish panel", () => {
    render(<PropertyForm />);

    expect(screen.getByText("0 of 5 sections ready")).toBeInTheDocument();
  });

  it("offers Save draft only once, outside the drawers", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    expect(screen.getAllByRole("button", { name: /save draft/i })).toHaveLength(
      1
    );

    await openBasics(user);
    await screen.findByLabelText(/monthly rent/i);

    // The drawer commits to form state only; the single Save draft outside it is what
    // writes to the server. (The drawer is modal, so while it is open the outside button
    // is hidden from the accessibility tree entirely.)
    expect(
      screen.queryByRole("button", { name: /save draft/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });

  it("does not pin its actions to the viewport", () => {
    // Regression guard. The actions used to sit in a `fixed inset-x-0 bottom-0 z-20` bar,
    // and the sidebar container is z-10 — so it painted over the sidebar's user footer
    // (avatar, Account, Settings, Log out) whenever the editor was open.
    const { container } = render(<PropertyForm />);

    const publish = screen.getByRole("button", { name: /publish/i });
    for (
      let node: HTMLElement | null = publish;
      node && node !== container;
      node = node.parentElement
    ) {
      const classes = node.className;
      if (typeof classes !== "string") continue;
      expect(classes).not.toMatch(/\bfixed\b/);
    }
  });

  it("renders the tenant preview with placeholders", () => {
    render(<PropertyForm />);

    expect(screen.getByText("Untitled listing")).toBeInTheDocument();
    expect(screen.getByText("Location not set")).toBeInTheDocument();
    expect(screen.getByText("No photos yet")).toBeInTheDocument();
  });

  it("opens a section without painting it red", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    await screen.findByLabelText(/listing headline/i);

    // A pristine section states what it needs, but does not accuse the owner of anything
    // before they have typed a character.
    expect(screen.getByRole("button", { name: /^save$/i })).toBeDisabled();
    expect(
      await screen.findByText(/1 field still needed/i)
    ).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="field-error"]')).toHaveLength(
      0
    );
    // Cancel is the only way out of an incomplete section.
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("reveals a field's error once the owner has edited it", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    const title = await screen.findByLabelText(/listing headline/i);

    await user.type(title, "ab");
    expect(
      await screen.findByText(/at least 5 characters/i)
    ).toBeInTheDocument();

    await user.type(title, "cdef");
    await waitFor(() =>
      expect(
        screen.queryByText(/at least 5 characters/i)
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
  });

  it("keeps the drawer open when a field is invalid", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    const title = await screen.findByLabelText(/listing headline/i);

    await user.type(title, "x".repeat(101));
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    // The gate must both surface the error and refuse to close.
    expect(
      await screen.findByText(/less than 100 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });

  it("closes the drawer once the field is fixed", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    const title = await screen.findByLabelText(/listing headline/i);

    await user.type(title, "x".repeat(101));
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText(/less than 100 characters/i);

    await user.clear(title);
    await user.type(title, "A perfectly fine title");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /^save$/i })
      ).not.toBeInTheDocument()
    );
  });

  it("reverts the section when the drawer is cancelled", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    await user.type(
      await screen.findByLabelText(/listing headline/i),
      "Discard me"
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText("Untitled listing")).toBeInTheDocument();
  });

  it("mirrors typed values into the preview", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    // Headline and rent now live in two different drawers.
    await openHeadline(user);
    await user.type(
      await screen.findByLabelText(/listing headline/i),
      "Bright condo in Thonglor"
    );
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(
        screen.queryByLabelText(/listing headline/i)
      ).not.toBeInTheDocument()
    );

    await openBasics(user);
    await completeBasics(user);
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.queryByLabelText(/monthly rent/i)).not.toBeInTheDocument()
    );

    expect(
      screen.getAllByText("Bright condo in Thonglor").length
    ).toBeGreaterThan(0);
    // Shown twice on purpose: once in the section summary, once in the preview.
    expect(screen.getAllByText(/THB\s?45,000/).length).toBe(2);
  });

  it("saves a draft without running the publish rules", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await user.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => expect(mocks.savePropertyAction).toHaveBeenCalled());
    const formData = mocks.savePropertyAction.mock.calls[0][1] as FormData;
    expect(formData.get("intent")).toBe("draft");
  });

  it("blocks publish on an incomplete listing and never calls the action", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This listing is not ready to publish yet"
      )
    );
    expect(mocks.savePropertyAction).not.toHaveBeenCalled();
  });

  it("submits an existing listing's id so the save is an update", async () => {
    const user = userEvent.setup();
    render(
      <PropertyForm
        property={
          {
            id: "7e2c4a88-91bd-4f3c-8a12-6d0e5b7f3c41",
            profileId: "u1",
            title: "Saved listing",
            propertyType: "condo",
            location: "Thonglor",
            monthlyRent: 45000,
            description: "",
            bedrooms: 2,
            bathrooms: 1,
            furnishedStatus: "furnished",
            amenities: ["ac"],
            images: [],
            status: "draft",
            createdAt: "2026-01-01T00:00:00Z",
          } as never
        }
      />
    );

    await user.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => expect(mocks.savePropertyAction).toHaveBeenCalled());
    const formData = mocks.savePropertyAction.mock.calls[0][1] as FormData;
    expect(formData.get("propertyId")).toBe(
      "7e2c4a88-91bd-4f3c-8a12-6d0e5b7f3c41"
    );
    expect(formData.get("title")).toBe("Saved listing");
    expect(formData.getAll("amenities")).toEqual(["ac"]);
  });

  it("sends saved images as manifest ids rather than re-uploading them", async () => {
    const user = userEvent.setup();
    render(
      <PropertyForm
        property={
          {
            id: "7e2c4a88-91bd-4f3c-8a12-6d0e5b7f3c41",
            profileId: "u1",
            title: "Saved listing",
            propertyType: "condo",
            location: "Thonglor",
            monthlyRent: 45000,
            description: "",
            bedrooms: 2,
            bathrooms: 1,
            furnishedStatus: "furnished",
            amenities: [],
            images: [
              {
                id: "img-1",
                storagePath: "u1/p1/a.jpg",
                sortOrder: 0,
                status: "uploaded",
              },
              {
                id: "img-2",
                storagePath: "u1/p1/b.jpg",
                sortOrder: 1,
                status: "uploaded",
              },
            ],
            status: "draft",
            createdAt: "2026-01-01T00:00:00Z",
          } as never
        }
      />
    );

    await user.click(screen.getByRole("button", { name: /save draft/i }));

    await waitFor(() => expect(mocks.savePropertyAction).toHaveBeenCalled());
    const formData = mocks.savePropertyAction.mock.calls[0][1] as FormData;
    expect(JSON.parse(formData.get("images") as string)).toEqual([
      { id: "img-1", fileIndex: null, sortOrder: 0 },
      { id: "img-2", fileIndex: null, sortOrder: 1 },
    ]);
    expect(formData.getAll("files")).toHaveLength(0);
  });
});
