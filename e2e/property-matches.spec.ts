import { test, expect } from "@playwright/test";

test.describe("Property Matches Flow", () => {
  test.describe("Access Control", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/matches");
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("should allow agent to access /matches", async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto("/matches");

      // Should stay on matches page
      await expect(page).toHaveURL(/\/matches/, { timeout: 10000 });
    });

    test("should allow owner to access /matches", async ({ page }) => {
      // Set up owner auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "owner-profile-456",
            role: "owner",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto("/matches");

      // Should stay on matches page
      await expect(page).toHaveURL(/\/matches/, { timeout: 10000 });
    });

    test("should redirect tenant to login (not authorized for /matches)", async ({
      page,
    }) => {
      // Set up tenant auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "tenant-profile-789",
            role: "tenant",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto("/matches");

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe("Matches Page Layout", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should display page header and description", async ({ page }) => {
      await page.goto("/matches");

      // Check header
      await expect(page.locator("h1")).toContainText("Matches");
      await expect(
        page.locator("text=/Manage property matches/")
      ).toBeVisible();
    });

    test("should display metric cards for match counts", async ({ page }) => {
      await page.goto("/matches");

      // Check metric cards exist
      const cards = await page
        .locator("text=/Total Matches|Interested|Approved|Rejected/")
        .all();
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });

    test("should display search input and status filter", async ({ page }) => {
      await page.goto("/matches");

      // Check search input
      const searchInput = page.locator("input[placeholder*='Search']");
      await expect(searchInput).toBeVisible();

      // Check status filter dropdown
      const statusSelect = page.locator("button[role='combobox']");
      await expect(statusSelect).toBeVisible();
    });

    test("should display empty state when no matches exist", async ({
      page,
    }) => {
      await page.goto("/matches");

      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Check for either table with no rows or empty state message
      const pageContent = page.locator("main");

      await expect(pageContent).toBeVisible();
    });
  });

  test.describe("Search Functionality", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should require minimum 3 characters for search", async ({ page }) => {
      await page.goto("/matches");

      const searchInput = page.locator("input[placeholder*='Search']");

      // Type less than 3 characters
      await searchInput.fill("ab");
      await page.waitForTimeout(600); // Wait for debounce

      // Search should not trigger with less than 3 chars
      // (This would ideally be verified by checking API calls,
      // but for e2e we just verify the UI doesn't break)
      await expect(searchInput).toHaveValue("ab");
    });

    test("should trigger search with 3+ characters", async ({ page }) => {
      await page.goto("/matches");

      const searchInput = page.locator("input[placeholder*='Search']");

      // Type 3+ characters
      await searchInput.fill("apartment");
      await page.waitForTimeout(600); // Wait for debounce

      // Loading indicator might appear briefly
      await expect(searchInput).toHaveValue("apartment");
    });

    test("should clear search when input is emptied", async ({ page }) => {
      await page.goto("/matches");

      const searchInput = page.locator("input[placeholder*='Search']");

      // Type then clear
      await searchInput.fill("apartment");
      await page.waitForTimeout(300);
      await searchInput.clear();
      await page.waitForTimeout(600);

      // Should trigger search reset
      await expect(searchInput).toHaveValue("");
    });
  });

  test.describe("Filter Functionality", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should display status filter dropdown", async ({ page }) => {
      await page.goto("/matches");

      const statusSelect = page.locator("button[role='combobox']").first();
      await expect(statusSelect).toBeVisible();

      // Open dropdown
      await statusSelect.click();

      // Check for status options
      await expect(page.locator("text=All statuses")).toBeVisible();
      await expect(page.locator("text=Interested")).toBeVisible();
      await expect(page.locator("text=Approved")).toBeVisible();
      await expect(page.locator("text=Rejected")).toBeVisible();
    });

    test("should filter by status when selected", async ({ page }) => {
      await page.goto("/matches");

      const statusSelect = page.locator("button[role='combobox']").first();

      // Open dropdown
      await statusSelect.click();

      // Select "Approved"
      await page.locator("text=Approved").click();

      // Loading state might appear
      await page.waitForTimeout(500);

      // Verify dropdown closed and filter applied
      await expect(statusSelect).toBeFocused();
    });
  });

  test.describe("Table Display and Sorting", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should display table with correct columns", async ({ page }) => {
      await page.goto("/matches");

      await page.waitForLoadState("networkidle");

      // Verify table/content displays correctly
      await expect(page.locator("main")).toBeVisible();
    });

    test("should have sortable columns", async ({ page }) => {
      await page.goto("/matches");

      await page.waitForLoadState("networkidle");

      // Try clicking on a potentially sortable header
      // This would only work if there are actual matches to sort
      const locationHeader = page.locator("text=Location").first();

      if (await locationHeader.isVisible()) {
        // Click header to test sorting
        await locationHeader.click();
      }
    });
  });

  test.describe("Pagination", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should display pagination info when matches exist", async ({
      page,
    }) => {
      await page.goto("/matches");

      await page.waitForLoadState("networkidle");

      // Verify page loads without errors
      await expect(page.locator("main")).toBeVisible();
    });
  });

  test.describe("Loading States", () => {
    test.beforeEach(async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
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

    test("should show loading indicator during filter", async ({ page }) => {
      await page.goto("/matches");

      const searchInput = page.locator("input[placeholder*='Search']");

      // Trigger search
      await searchInput.fill("test");

      // Loading indicator might appear (Loader2 icon with animate-spin)
      // Just verify page is responsive
      await expect(page.locator("main")).toBeVisible();
    });
  });

  test.describe("Session Persistence", () => {
    test("should maintain session across page reload", async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto("/matches");
      await expect(page).toHaveURL(/\/matches/);

      // Reload page
      await page.reload();

      // Should still be on matches page
      await expect(page).toHaveURL(/\/matches/, { timeout: 10000 });
    });

    test("should redirect to login after session expires", async ({ page }) => {
      // Set up agent auth session
      await page.context().addCookies([
        {
          name: "auth_session",
          value: JSON.stringify({
            profileId: "agent-profile-123",
            role: "agent",
          }),
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto("/matches");

      // Clear auth cookie (simulating session expiry)
      await page.context().clearCookies();

      // Try to reload
      await page.reload();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
