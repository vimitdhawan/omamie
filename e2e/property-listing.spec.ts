import { test, expect, type Page } from "@playwright/test";

/**
 * Property listing flow (agent/owner).
 *
 * Requires the local Supabase stack with `e2e/supabase/seed.sql` applied — the
 * `e2e-owner@omamie.test` / `e2e-tenant@omamie.test` credentials come from there.
 */

const OWNER = { email: "e2e-owner@omamie.test", password: "Test1234!" };
const TENANT = { email: "e2e-tenant@omamie.test", password: "Test1234!" };

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(user.email);
  await page
    .getByLabel(/password/i)
    .first()
    .fill(user.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15000,
  });
}

async function openSection(page: Page, section: string) {
  await page.getByRole("button", { name: `Edit ${section}` }).click();
}

async function openHeadline(page: Page) {
  await openSection(page, "Headline & Description");
  await expect(page.getByLabel(/listing headline/i)).toBeVisible();
}

async function openBasics(page: Page) {
  await openSection(page, "Property Basics & Rental Terms");
  await expect(page.getByLabel(/monthly rent/i)).toBeVisible();
}

/** Fills every field that blocks the basics section from being saved. */
async function completeBasics(page: Page) {
  await page.getByRole("radio", { name: "Condo" }).click();
  await page.getByLabel(/neighbourhood/i).fill("Sukhumvit 26, Bangkok");
  await page.getByLabel(/monthly rent/i).fill("45000");
}

const SECTIONS = [
  "Property Basics & Rental Terms",
  "Bedrooms, Bathrooms & Specs",
  "Property Photos",
  "Amenities & Building Highlights",
  "Headline & Description",
];

test.describe("Access control", () => {
  test("redirects an unauthenticated visitor to login", async ({ page }) => {
    await page.goto("/properties/create");

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("keeps a tenant out of the listing form", async ({ page }) => {
    await login(page, TENANT);

    await page.goto("/properties/create");

    await expect(page).toHaveURL(/\/find-property/, { timeout: 15000 });
  });

  test("lets an owner reach the listing form", async ({ page }) => {
    await login(page, OWNER);

    await page.goto("/properties/create");

    await expect(page).toHaveURL(/\/properties\/create/);
    await expect(
      page.getByRole("heading", { name: /list a property/i })
    ).toBeVisible();
  });
});

test.describe("Single-form listing editor", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, OWNER);
    await page.goto("/properties/create");
  });

  test("shows all five sections and an empty tenant preview", async ({
    page,
  }) => {
    for (const section of SECTIONS) {
      await expect(
        page.getByRole("button", { name: `Edit ${section}` })
      ).toBeVisible();
    }
    await expect(page.getByText("0 of 5 sections ready")).toBeVisible();
    await expect(page.getByText("Untitled listing")).toBeVisible();
    await expect(page.getByText("No photos yet")).toBeVisible();
  });

  test("leaves the sidebar's user footer reachable while editing", async ({
    page,
  }) => {
    // The actions used to sit in a viewport-fixed bar above the sidebar's z-index, which
    // covered this control entirely.
    const accountButton = page
      .getByRole("button", { name: /e2e owner/i })
      .last();

    await expect(accountButton).toBeVisible();
    await accountButton.click();
    await expect(
      page.getByRole("menuitem", { name: /log out/i })
    ).toBeVisible();
  });

  test("will not close the drawer while a field is invalid", async ({
    page,
  }) => {
    await openHeadline(page);
    const save = page.getByRole("button", { name: /^save$/i });

    await page.getByLabel(/listing headline/i).fill("x".repeat(101));

    // An invalid section cannot be carried into a save at all: the button is disabled
    // rather than clickable-but-inert.
    await expect(page.getByText(/less than 100 characters/i)).toBeVisible();
    await expect(save).toBeDisabled();
    await expect(page.getByLabel(/listing headline/i)).toBeVisible();

    await page.getByLabel(/listing headline/i).fill("Bright condo in Thonglor");
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByLabel(/listing headline/i)).toBeHidden();
  });

  test("mirrors what is typed into the tenant preview", async ({ page }) => {
    // Headline and rent now live in two different drawers.
    await openHeadline(page);
    await page.getByLabel(/listing headline/i).fill("Bright condo in Thonglor");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByLabel(/listing headline/i)).toBeHidden();

    await openBasics(page);
    await completeBasics(page);
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByLabel(/monthly rent/i)).toBeHidden();

    await expect(
      page.getByText("Bright condo in Thonglor").first()
    ).toBeVisible();
    await expect(page.getByText(/45,000/).first()).toBeVisible();
  });

  test("carries the new listing detail fields through a save", async ({
    page,
  }) => {
    await openBasics(page);
    await completeBasics(page);
    await page.getByLabel(/security deposit/i).fill("2");
    await page.getByLabel(/available from/i).fill("2026-11-01");
    await page.getByLabel(/building \/ condo name/i).fill("The Estelle");
    await page.getByRole("radio", { name: "12 months" }).click();
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByLabel(/monthly rent/i)).toBeHidden();

    await openSection(page, "Bedrooms, Bathrooms & Specs");
    await page.getByLabel(/usable floor area/i).fill("85");
    // Furnishing is required to publish, so the specs section will not save without it.
    await page.getByRole("radio", { name: "Fully Furnished" }).click();
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByLabel(/usable floor area/i)).toBeHidden();

    await page
      .getByRole("button", { name: /save draft/i })
      .first()
      .click();
    await page.waitForURL(/\/properties\/[0-9a-f-]+\/edit/, { timeout: 20000 });
    await page.reload();

    await expect(page.getByText("2 mo deposit")).toBeVisible();
    await expect(page.getByText("12 mo min lease")).toBeVisible();
    // The preview meta line proves the area survived the round trip.
    await expect(page.getByText(/85 m²/).first()).toBeVisible();
    // The building name reached the shared condo registry and came back on reload.
    await expect(page.getByText(/The Estelle/).first()).toBeVisible();
  });

  test("reports pending state while saving", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        warnings.push(message.text());
      }
    });

    await openHeadline(page);
    await page.getByLabel(/listing headline/i).fill("Pending state check");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByLabel(/listing headline/i)).toBeHidden();

    const publish = page.getByRole("button", { name: /^publish$/i });
    await page.getByRole("button", { name: /save draft/i }).click();

    // isPending only updates when formAction is called inside a transition; without it
    // React warns and the buttons never reflect the in-flight save.
    await expect(publish).toBeDisabled();
    await page.waitForURL(/\/properties\/[0-9a-f-]+\/edit/, { timeout: 20000 });
    await expect(publish).toBeEnabled();

    expect(
      warnings.filter((w) => w.includes("outside of a transition"))
    ).toEqual([]);
  });

  test("a photo saved as a draft is not uploaded twice", async ({ page }) => {
    await openSection(page, "Property Photos");
    await page.setInputFiles('input[type="file"]', {
      name: "room.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001",
        "hex"
      ),
    });
    await page.getByRole("button", { name: /^save$/i }).click();

    await page
      .getByRole("button", { name: /save draft/i })
      .first()
      .click();
    await page.waitForURL(/\/properties\/[0-9a-f-]+\/edit/, { timeout: 20000 });
    await expect(page.getByText("1 photo")).toBeVisible({ timeout: 15000 });

    // Saving again must not duplicate it: the form has to swap the local File for the
    // saved row once the server confirms, or every save re-uploads the same picture.
    await page
      .getByRole("button", { name: /save draft/i })
      .first()
      .click();
    // An update-in-place save has no URL to wait on (it calls router.refresh(), not
    // router.replace()), so wait on the actual completion signal rather than a fixed sleep —
    // a slow save round-trip in CI would otherwise let the reload below race ahead of it.
    await expect(page.getByText(/draft saved/i)).toBeVisible({
      timeout: 15000,
    });
    await page.reload();

    await expect(page.getByText("1 photo")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("2 photos")).toBeHidden();
  });

  test("offers Save draft once, outside the section drawers", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: /save draft/i })).toHaveCount(
      1
    );

    await openBasics(page);

    // The drawer only commits to form state; saving happens in one place.
    await expect(page.getByRole("button", { name: /save draft/i })).toHaveCount(
      0
    );
    await expect(page.getByRole("button", { name: /^save$/i })).toBeVisible();
  });

  test("saves a partial draft and reloads it", async ({ page }) => {
    await openHeadline(page);
    await page.getByLabel(/listing headline/i).fill("Draft only a title");
    await page.getByRole("button", { name: /^save$/i }).click();

    await page
      .getByRole("button", { name: /save draft/i })
      .first()
      .click();

    // A create redirects the browser to the edit route once the row exists.
    await page.waitForURL(/\/properties\/[0-9a-f-]+\/edit/, { timeout: 20000 });
    await page.reload();

    await expect(page.getByText("Draft only a title").first()).toBeVisible();
    await expect(page.getByText("Draft").first()).toBeVisible();
  });

  test("refuses to publish an incomplete listing", async ({ page }) => {
    await openHeadline(page);
    await page.getByLabel(/listing headline/i).fill("Not ready to publish");
    await page.getByRole("button", { name: /^save$/i }).click();

    await page.getByRole("button", { name: /^publish$/i }).click();

    await expect(
      page.getByText(/not ready to publish yet/i).first()
    ).toBeVisible({ timeout: 15000 });
    // Nothing was submitted, so the route never changes.
    await expect(page).toHaveURL(/\/properties\/create/);
  });

  test("blocks Save until a section has what it needs", async ({ page }) => {
    await openSection(page, "Headline & Description");

    const save = page.getByRole("button", { name: /^save$/i });
    await expect(save).toBeDisabled();
    await expect(page.getByText(/still needed/i)).toBeVisible();
    // Cancel is the only way out of an incomplete section.
    await expect(page.getByRole("button", { name: "Cancel" })).toBeEnabled();

    await page.getByLabel(/listing headline/i).fill("A perfectly good title");
    await expect(save).toBeEnabled();
  });

  test("marks the optional amenities section complete once reviewed", async ({
    page,
  }) => {
    const card = page.getByRole("button", {
      name: "Edit Amenities & Building Highlights",
    });

    // Nothing is required here — a plain house may have no building facilities at all.
    await expect(page.getByText("Optional")).toBeVisible();

    await card.click();
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByText("Optional")).toBeHidden();
    await expect(page.getByText("1 of 5 sections ready")).toBeVisible();
  });
});
