import { test, expect } from "@playwright/test";

test.describe("List Property Flow", () => {
  // Note: These tests require authenticated users. Skipping in E2E until auth setup is added.
  // In production, these routes are protected by middleware and require valid sessions.
  test.skip("should display the property listing form", async ({ page }) => {
    await page.goto("/list-property");

    // Check page title
    await expect(
      page.getByRole("heading", { name: "List Your Property" })
    ).toBeVisible();

    // Check stepper is visible
    await expect(page.getByText("Property Details")).toBeVisible();
    await expect(page.getByText("Amenities")).toBeVisible();
    await expect(page.getByText("Review")).toBeVisible();

    // Check Step 1 fields are visible
    await expect(page.getByText("Property Type")).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g., Luxury 2BR Apartment")
    ).toBeVisible();
  });

  test.skip("should navigate through all 3 steps", async ({ page }) => {
    await page.goto("/list-property");

    // Step 1: Fill property details
    await page.getByRole("radio", { name: "Apartment" }).click();
    await page
      .getByPlaceholder("e.g., Luxury 2BR Apartment")
      .fill("Test Property");
    await page
      .getByPlaceholder("Search area, landmark or neighborhood")
      .fill("Bangkok");
    await page.getByPlaceholder("0").fill("25000");

    // Go to Step 2
    await page.getByRole("button", { name: "Next" }).click();

    // Verify Step 2 is visible
    await expect(page.getByText("Property Information")).toBeVisible();
    await expect(page.getByText("Bedrooms")).toBeVisible();

    // Fill Step 2
    await page.getByRole("radio", { name: "Fully Furnished" }).first().click();

    // Go to Step 3
    await page.getByRole("button", { name: "Next" }).click();

    // Verify Step 3 is visible
    await expect(page.getByText("Review & Publish")).toBeVisible();
    await expect(page.getByText("Review Summary")).toBeVisible();

    // Check that property details are shown in review
    await expect(page.getByText("Test Property")).toBeVisible();
    await expect(page.getByText("Bangkok")).toBeVisible();
  });

  test.skip("should allow going back to previous steps", async ({ page }) => {
    await page.goto("/list-property");

    // Go to Step 2
    await page.getByRole("radio", { name: "Apartment" }).click();
    await page.getByPlaceholder("e.g., Luxury 2BR Apartment").fill("Test");
    await page
      .getByPlaceholder("Search area, landmark or neighborhood")
      .fill("Bangkok");
    await page.getByPlaceholder("0").fill("20000");
    await page.getByRole("button", { name: "Next" }).click();

    // Verify on Step 2
    await expect(page.getByText("Property Information")).toBeVisible();

    // Click Back
    await page.getByRole("button", { name: "Back" }).click();

    // Verify back on Step 1
    await expect(page.getByText("Property Details")).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g., Luxury 2BR Apartment")
    ).toHaveValue("Test");
  });

  test.skip("should show 'Back to Home' on Step 1", async ({ page }) => {
    await page.goto("/list-property");

    await expect(
      page.getByRole("link", { name: "Back to Home" })
    ).toBeVisible();
  });

  test.skip("should require checkboxes to be checked before submitting", async ({
    page,
  }) => {
    await page.goto("/list-property");

    // Fill Step 1
    await page.getByRole("radio", { name: "Apartment" }).click();
    await page
      .getByPlaceholder("e.g., Luxury 2BR Apartment")
      .fill("Test Property");
    await page
      .getByPlaceholder("Search area, landmark or neighborhood")
      .fill("Bangkok");
    await page.getByPlaceholder("0").fill("25000");
    await page.getByRole("button", { name: "Next" }).click();

    // Step 2
    await page.getByRole("button", { name: "Next" }).click();

    // Step 3 - Verify Publish button is disabled
    const publishButton = page.getByRole("button", { name: "Publish Listing" });
    await expect(publishButton).toBeDisabled();

    // Check both checkboxes
    await page.getByRole("checkbox").first().check();
    await page.getByRole("checkbox").nth(1).check();

    // Verify button is now enabled
    await expect(publishButton).toBeEnabled();
  });
});
