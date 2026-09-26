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
  // Property type defaults to Condo and minimum lease defaults to 12 months already, so
  // neither needs a click here.
  await user.type(await screen.findByLabelText(/monthly rent/i), "45000");

  await user.type(screen.getByLabelText(/neighbourhood/i), "Thonglor");
  // Selecting a suggestion is what supplies the coordinates a listing needs; typing the
  // name alone leaves the listing without a pin.
  await user.click(await screen.findByRole("button", { name: /Thonglor/ }));

  await user.type(screen.getByLabelText(/available from/i), "2026-10-01");
  await user.type(screen.getByLabelText(/security deposit/i), "2");
}

function openSection(
  user: ReturnType<typeof userEvent.setup>,
  section: string
) {
  return user.click(screen.getByRole("button", { name: `Edit ${section}` }));
}

const openBasics = (user: ReturnType<typeof userEvent.setup>) =>
  openSection(user, "Property Basics & Rental Terms");
const openSpecs = (user: ReturnType<typeof userEvent.setup>) =>
  openSection(user, "Bedrooms, Bathrooms & Specs");
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
    // has a summary line to show. Basics is not in the list either: property type
    // defaults to Condo, so it always has a summary line too.
    expect(screen.getAllByText("Nothing filled in yet.").length).toBe(3);
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
    // before they have typed a character or pressed Save.
    expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled();
    expect(document.querySelectorAll('[data-slot="field-error"]')).toHaveLength(
      0
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("clears the location error once a suggestion is picked", async () => {
    // Regression guard. Coordinates are set with `shouldValidate: false`, so nothing
    // triggered the resolver to clear a hand-set "select a suggestion" error -- it stuck
    // around even after the owner picked one.
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openBasics(user);
    await user.type(screen.getByLabelText(/neighbourhood/i), "Thonglor");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/select a neighbourhood from the suggestions/i)
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole(
        "button",
        { name: /Thonglor/ },
        // The 300ms input debounce plus the mocked suggestions round trip can outrun
        // testing-library's default 1000ms wait under CI load; give it more room.
        { timeout: 3000 }
      )
    );

    await waitFor(
      () =>
        expect(
          screen.queryByText(/select a neighbourhood from the suggestions/i)
        ).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it("holds back the location error while the owner is still typing in it", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openBasics(user);
    const neighbourhood = screen.getByLabelText(/neighbourhood/i);
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText(/location is required/i);

    // Focusing the field is what should silence the error, before anything is even typed.
    await user.click(neighbourhood);
    expect(screen.queryByText(/location is required/i)).not.toBeInTheDocument();

    await user.type(neighbourhood, "Thong");
    expect(
      screen.queryByText(/select a neighbourhood from the suggestions/i)
    ).not.toBeInTheDocument();

    // Leaving the field without picking a suggestion is what brings the error back.
    await user.tab();
    expect(
      await screen.findByText(/select a neighbourhood from the suggestions/i)
    ).toBeInTheDocument();
  });

  it("rejects a negative bedroom count instead of silently clamping it", async () => {
    // Regression guard. A silent clamp used to leave the (uncontrolled) input showing
    // "-23" while the stored value was quietly 1, with no error to explain the mismatch.
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openSpecs(user);
    const bedrooms = await screen.findByRole("spinbutton", {
      name: /^bedrooms/i,
    });
    await user.clear(bedrooms);
    await user.type(bedrooms, "-23");
    await user.tab();

    expect(
      await screen.findByText(/at least 1 bedroom is required/i)
    ).toBeInTheDocument();
    expect(bedrooms).toHaveValue(-23);
  });

  it("shows a required error for bedrooms/bathrooms once cleared, not just once negative", async () => {
    // Regression guard. An emptied count used to silently fall back to 1 -- a valid value --
    // so the field looked blank yet never showed a "required" error at all.
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openSpecs(user);
    const bedrooms = await screen.findByRole("spinbutton", {
      name: /^bedrooms/i,
    });
    const bathrooms = screen.getByRole("spinbutton", { name: /^bathrooms/i });

    await user.clear(bedrooms);
    await user.clear(bathrooms);
    await user.tab();

    expect(
      await screen.findByText(/at least 1 bedroom is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/at least 1 bathroom is required/i)
    ).toBeInTheDocument();
  });

  it("defaults furnishing to Fully Furnished on a new listing", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openSpecs(user);
    await screen.findByRole("spinbutton", { name: /^bedrooms/i });

    expect(
      screen.getByRole("radio", { name: "Fully Furnished" })
    ).toHaveAttribute("aria-checked", "true");
  });

  it("rejects a building shorter than the unit's own floor, but allows leaving it empty", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openSpecs(user);
    const floor = await screen.findByRole("spinbutton", {
      name: /^floor\b/i,
    });
    await user.type(floor, "18");
    const totalFloors = screen.getByRole("spinbutton", {
      name: /floors in building/i,
    });
    await user.type(totalFloors, "10");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/must be at least the floor number/i)
    ).toBeInTheDocument();

    await user.clear(totalFloors);
    await waitFor(() =>
      expect(
        screen.queryByText(/must be at least the floor number/i)
      ).not.toBeInTheDocument()
    );
  });

  it("does not reveal a required field's error just from tabbing past it", async () => {
    // Regression guard. RHF's own `touchedFields` flips on blur regardless of whether the
    // value changed, so simply tabbing through the section on the way to a field the owner
    // actually meant to fill used to paint every empty field red along the way.
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openSpecs(user);
    const floor = await screen.findByRole("spinbutton", {
      name: /^floor\b/i,
    });
    // Tab past "Usable floor area" (still empty) on the way to "Floor", never typing in it.
    await user.click(floor);

    expect(
      screen.queryByText(/floor area is required/i)
    ).not.toBeInTheDocument();

    await user.type(floor, "18");
    await user.tab();

    // Blurring "Floor" after actually filling it must not paint the still-untouched,
    // still-empty area field red either.
    expect(
      screen.queryByText(/floor area is required/i)
    ).not.toBeInTheDocument();
  });

  it("holds an error back while the owner is still typing, and reveals it once they leave the field", async () => {
    const user = userEvent.setup();
    render(<PropertyForm />);

    await openHeadline(user);
    const title = await screen.findByLabelText(/listing headline/i);

    await user.type(title, "ab");
    expect(
      screen.queryByText(/at least 5 characters/i)
    ).not.toBeInTheDocument();

    await user.tab();
    expect(
      await screen.findByText(/at least 5 characters/i)
    ).toBeInTheDocument();

    // Once shown, it still clears live as they fix it -- no need to leave the field again.
    await user.click(title);
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

  it("links a single acceptance checkbox to the Property Listing Terms & Conditions", () => {
    // Accuracy of the listing is covered by those terms, so there is only one checkbox
    // here, not a separate "the details are accurate" one.
    render(<PropertyForm />);

    expect(
      screen.getByRole("checkbox", { name: /property listing terms/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/the details are accurate/i)
    ).not.toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: /property listing terms/i,
    });
    expect(link).toHaveAttribute("href", "/terms/property-listing");
    expect(link).toHaveAttribute("target", "_blank");
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
