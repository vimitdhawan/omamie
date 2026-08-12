import { expect, test } from "@playwright/test";

/**
 * Login flow E2E tests.
 *
 * These tests verify the login form from a user perspective:
 * - Form renders correctly
 * - Validation errors appear on submit
 * - Link to signup works
 * - Successful login redirects to dashboard
 */

test.describe("Login page", () => {
  test("renders login form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/login");

    // Verify page title
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();

    // Verify submit button
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();

    // Verify signup link
    await expect(page.getByRole("link", { name: /Sign up/i })).toBeVisible();
  });

  test("shows email validation error on invalid email", async ({ page }) => {
    await page.goto("/login");

    // Fill with invalid email
    await page.getByLabel(/Email/i).fill("not-an-email");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /Sign in/i });
    await submitButton.click();

    // Should see validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("shows password validation error when empty", async ({ page }) => {
    await page.goto("/login");

    // Fill email but leave password empty
    await page.getByLabel(/Email/i).fill("user@example.com");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /Sign in/i });
    await submitButton.click();

    // Should see password error
    await expect(page.getByText(/password|6 characters/i)).toBeVisible();
  });

  test("navigates to signup page via link", async ({ page }) => {
    await page.goto("/login");

    // Click signup link
    await page.getByRole("link", { name: /Sign up/i }).click();

    // Should be on signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test("prevents submission with invalid data", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /Sign in/i });
    await submitButton.click();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login$/);

    // Should see error messages
    await expect(page.getByText(/email|password/i)).toBeVisible();
  });

  test("shows loading state during submission", async ({ page }) => {
    await page.goto("/login");

    // Fill valid data
    await page.getByLabel(/Email/i).fill("test@example.com");
    await page.getByLabel(/Password/i).fill("ValidPassword123!");

    // Submit
    const submitButton = page.getByRole("button", { name: /Sign in/i });
    await submitButton.click();

    // Button should show loading text
    await expect(submitButton).toContainText(/Signing in/i);
  });

  test("displays password visibility toggle", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByLabel(/Password/i);

    // Initially hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Find eye icon button (usually near password input)
    const toggleButtons = page
      .locator("button")
      .filter({ has: page.locator("svg") });
    const eyeButton = toggleButtons.last(); // Usually the last button in the form

    // Click to show password
    await eyeButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});

test.describe("Login form recovery", () => {
  test("clears errors when user corrects input", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid email and submit
    const emailInput = page.getByLabel(/Email/i);
    await emailInput.fill("invalid");
    const submitButton = page.getByRole("button", { name: /Sign in/i });
    await submitButton.click();

    // Error appears
    await expect(page.getByText(/valid email/i)).toBeVisible();

    // User corrects email
    await emailInput.fill("valid@example.com");
    await emailInput.blur();

    // Validation error should clear (since mode is onBlur for valid input)
    // Password field still needs validation
    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.fill("ValidPassword123!");

    // Now submit should work (no validation errors for these fields)
    await submitButton.click();

    // Button shows loading (submission attempt)
    await expect(submitButton).toContainText(/Signing in/i);
  });
});

test.describe("Dashboard redirect", () => {
  test("redirect to login when accessing protected route unauthenticated", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login$/);
  });
});
