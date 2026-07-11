import { expect, test } from "@playwright/test";

/**
 * Smoke tests for the public marketing home page.
 *
 * These do not require Supabase — they verify the public layout renders and
 * navigation links route correctly. They serve as the minimum bar that any
 * CI run must pass.
 */
test.describe("Home page", () => {
  test("renders hero and primary CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Omamie/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Get started/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /^Log in$/ })).toBeVisible();
  });

  test("Log in link navigates to /login", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /^Log in$/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Sign up link navigates to /signup", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Sign up/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
