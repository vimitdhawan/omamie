import { test, expect } from "@playwright/test";

/**
 * Find Property Page E2E Tests
 *
 * Tests verify role-based access control:
 * - Only tenant role can access /find-property
 * - Agent/owner are redirected to /list-property
 * - Unauthenticated users redirected to /login
 */

test.describe("Find Property Page", () => {
  test.describe("Access Control by Role", () => {
    test.skip("should allow tenant to access /find-property", async ({
      page,
    }) => {
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

      // Navigate to find-property
      await page.goto("/find-property");

      // Should stay on find-property
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });
    });

    test.skip("should redirect agent to /list-property", async ({ page }) => {
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

      // Try to access find-property
      await page.goto("/find-property");

      // Should redirect to list-property (agent's allowed route)
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });
    });

    test.skip("should redirect owner to /list-property", async ({ page }) => {
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

      // Try to access find-property
      await page.goto("/find-property");

      // Should redirect to list-property (owner's allowed route)
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });
    });

    test("should redirect unauthenticated users to /login", async ({
      page,
    }) => {
      // Navigate without auth session
      await page.goto("/find-property");

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe("Tenant Experience", () => {
    test.beforeEach(async ({ page }) => {
      // Set up tenant auth session before each test
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
    });

    test("should display find-property content for tenant", async ({
      page,
    }) => {
      await page.goto("/find-property");

      // Verify on find-property page
      await expect(page).toHaveURL(/\/find-property/);

      // Page should load without errors
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("should maintain tenant session after reload", async ({ page }) => {
      await page.goto("/find-property");
      await expect(page).toHaveURL(/\/find-property/);

      // Reload page
      await page.reload();

      // Should still be on find-property
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });

      // Verify auth session still exists
      const cookies = await page.context().cookies();
      const authCookie = cookies.find((c) => c.name === "auth_session");
      expect(authCookie).toBeDefined();
      expect(authCookie?.value).toContain("tenant-profile-123");
    });

    test.skip("tenant redirects if trying to access list-property", async ({
      page,
    }) => {
      // Try to access list-property (not allowed for tenant)
      await page.goto("/list-property");

      // Should redirect back to find-property
      await expect(page).toHaveURL(/\/find-property/, { timeout: 10000 });
    });
  });

  test.describe("Cookie and Session Management", () => {
    test("invalid auth_session redirects to login", async ({ page }) => {
      // Set up invalid auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: "invalid-json{[",
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Try to access find-property
      await page.goto("/find-property");

      // Should redirect to login (invalid session)
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("missing role in auth_session redirects to login", async ({
      page,
    }) => {
      // Set up auth session without role field
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "test-123",
            // role field is missing
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      // Try to access find-property
      await page.goto("/find-property");

      // Should redirect to login (no valid role)
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("clearing auth_session redirects to login", async ({ page }) => {
      // Set up tenant session
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

      // Navigate to find-property
      await page.goto("/find-property");
      await expect(page).toHaveURL(/\/find-property/);

      // Clear the auth cookie
      await page.context().clearCookies();

      // Reload page
      await page.reload();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe("Cross-role Redirect Consistency", () => {
    test("agent trying find-property always redirects to list-property", async ({
      page,
    }) => {
      // Set up agent session
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

      // First attempt
      await page.goto("/find-property");
      await expect(page).toHaveURL(/\/list-property/);

      // Reload and try again
      await page.goto("/find-property");
      await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });

      // Verify consistent redirect
      const finalUrl = page.url();
      expect(finalUrl).toContain("/list-property");
    });

    test("owner trying find-property always redirects to list-property", async ({
      page,
    }) => {
      // Set up owner session
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

      // Multiple attempts should all redirect to list-property
      for (let i = 0; i < 3; i++) {
        await page.goto("/find-property");
        await expect(page).toHaveURL(/\/list-property/, { timeout: 10000 });
      }
    });
  });
});
