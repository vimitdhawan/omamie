import { expect, test } from "@playwright/test";

/**
 * Smoke tests for the public marketing home page.
 *
 * These do not require Supabase — they verify the public layout renders and
 * navigation links route correctly. They serve as the minimum bar that any
 * CI run must pass.
 */
test.describe("Home page", () => {
  test("renders hero with heading and primary CTAs", async ({ page }) => {
    await page.goto("/");

    // Hero heading
    await expect(
      page.getByRole("heading", { name: /Find the Right Rental Match Faster/i })
    ).toBeVisible();

    // Hero CTAs - target the first occurrence in hero section
    const heroSection = page.locator("section").first();
    await expect(
      heroSection.getByRole("button", { name: /Find Property/i })
    ).toBeVisible();
    await expect(
      heroSection.getByRole("button", { name: /List Your Property/i })
    ).toBeVisible();
  });

  test("footer has logo and navigation links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");

    // Footer brand logo (in footer, not header)
    await expect(
      footer.getByRole("link", { name: /Omamie Home/i })
    ).toBeVisible();

    // Footer navigation columns
    await expect(footer.getByText(/Get Started/i)).toBeVisible();
    await expect(footer.getByText(/Company/i)).toBeVisible();
    await expect(footer.getByText(/Follow Us/i)).toBeVisible();

    // Footer links
    await expect(footer.getByRole("link", { name: /FAQ/i })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /List Your Property/i })
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: /About/i })).toBeVisible();
  });

  test("footer legal links present", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /Privacy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Terms/i })).toBeVisible();
  });
});
