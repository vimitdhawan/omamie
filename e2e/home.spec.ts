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
});
