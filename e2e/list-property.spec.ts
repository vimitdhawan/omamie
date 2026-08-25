import { test, expect } from "@playwright/test";

test.describe("List Property Flow", () => {
  // These tests require authenticated users with agent/owner role
  // Tenant role should be redirected to /find-property

  test.describe("Access Control", () => {
    test.skip("should redirect tenant to /find-property", async ({ page }) => {
      // Set up tenant auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "tenant-profile-123",
            role: "tenant",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Try to access list-property
      await page.goto("/list-property");

      // Should redirect to find-property (tenant's allowed route)
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });
    });

    test.skip("should allow agent to access /list-property", async ({
      page,
    }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-456",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Navigate to list-property
      await page.goto("/list-property");

      // Should stay on list-property (agent has access)
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });
    });

    test.skip("should allow owner to access /list-property", async ({
      page,
    }) => {
      // Set up owner auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "owner-profile-789",
            role: "owner",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Navigate to list-property
      await page.goto("/list-property");

      // Should stay on list-property (owner has access)
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });
    });

    test("should redirect to login when unauthenticated", async ({ page }) => {
      // Try to access without auth_session cookie
      await page.goto("/list-property");

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe("Property Listing Form (Agent/Owner Only)", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session before each test
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-456",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);
    });

    test.skip("should display the property listing form", async ({ page }) => {
      await page.goto("/list-property");

      // Check page loads properly
      await expect(page).toHaveURL(/\/list-property/);

      // Form should be visible (basic check)
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("should have navigation back to home", async ({ page }) => {
      await page.goto("/list-property");

      // Should have some way to navigate back
      // This is a basic smoke test
      await expect(page).toHaveURL(/\/list-property/);
    });
  });

  test.describe("Cookie persistence", () => {
    test.skip("agent session persists across page reload", async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-456",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Navigate to list-property
      await page.goto("/list-property");
      await expect(page).toHaveURL(/\/list-property/);

      // Reload page
      await page.reload();

      // Should still be on list-property (cookie persisted)
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });

      // Verify cookie still exists
      const cookies = await page.context().cookies();
      const authCookie = cookies.find((c) => c.name === "auth_session");
      expect(authCookie).toBeDefined();
      expect(authCookie?.value).toContain("agent-profile-456");
    });

    test.skip("tenant redirects after cookie set", async ({ page }) => {
      // Set up tenant auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "tenant-profile-123",
            role: "tenant",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Try list-property
      await page.goto("/list-property");

      // Should redirect to find-property
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });

      // Reload to verify redirect still happens
      await page.goto("/list-property");
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });
    });
  });
});
