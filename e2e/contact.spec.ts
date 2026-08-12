import { expect, test } from "@playwright/test";

/**
 * Contact page tests.
 *
 * - Smoke tests (renders, no auth redirect) do NOT depend on the local
 *   Supabase stack — they verify the public route renders and the form is
 *   present.
 * - Flow tests (submit + DB verification) require the local Supabase stack
 *   with the contact_messages migration applied (see playwright.config.ts
 *   webServer + CI supabase start + db reset).
 */

test.describe("Contact page — smoke", () => {
  test("renders the contact form without auth redirect", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveURL(/\/contact$/);

    await expect(
      page.getByRole("heading", { name: /Contact Us/i })
    ).toBeVisible();

    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Phone \(optional\)/i)).toBeVisible();
    await expect(page.getByLabel(/Reason for Contact/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Send Message/i })
    ).toBeVisible();
  });

  test("shows a back-to-home link that navigates to /", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("landing page Contact Us button navigates to /contact", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Contact Us/i }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });
});

test.describe("Contact page — form validation", () => {
  test("submits empty form and surfaces required field errors", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /Send Message/i }).click();

    await expect(page.getByText(/At least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/Enter a valid email address/i)).toBeVisible();
    await expect(
      page.getByText(/Message must be at least 10 characters/i)
    ).toBeVisible();
  });
});

test.describe("Contact page — successful submission (local Supabase)", () => {
  test("submits a valid message and shows success banner", async ({ page }) => {
    // This test requires the local Supabase stack running with the
    // contact_messages table created by the migration. See playwright.config
    // and CI for setup commands (supabase start + db reset).
    test.skip(
      process.env.CI !== "true" && !process.env.SUPABASE_URL,
      "requires local Supabase stack (run `supabase start` then seed)"
    );

    await page.goto("/contact");

    await page.getByLabel(/Full Name/i).fill("Jane Tester");
    await page.getByLabel(/Email/i).fill("jane@example.com");
    await page.getByLabel(/Phone \(optional\)/i).fill("+1 (555) 123-4567");
    await page.getByLabel(/Reason for Contact/i).click();
    await page.getByRole("option", { name: /General Question/i }).click();
    await page
      .getByLabel(/Message/i)
      .fill("I'd love to learn more about Omamie's property listings.");

    await page.getByRole("button", { name: /Send Message/i }).click();

    await expect(page.getByText(/We've received your inquiry/i)).toBeVisible();

    // Form should be cleared after successful submission
    await expect(page.getByLabel(/Full Name/i)).toHaveValue("");
    await expect(page.getByLabel(/Email/i)).toHaveValue("");
    await expect(page.getByLabel(/Message/i)).toHaveValue("");
  });
});
