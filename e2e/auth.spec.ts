import { expect, test } from "@playwright/test";

/**
 * Auth smoke tests.
 *
 * These tests do NOT exercise a successful login against Supabase — that
 * belongs in a dedicated spec that depends on the local Supabase stack being
 * seeded with a known user (see `e2e/supabase/seed.sql`). Here we only verify
 * the form renders, validation surfaces, and the dashboard route is gated.
 */
test.describe("Login page", () => {
  test("renders the login form with email + password fields", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Email/i })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: /Password/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });

  test("navigates to signup via the card footer link", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Sign up/i }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });
});

test.describe("Dashboard authorization gate", () => {
  test("redirects unauthenticated visits to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
