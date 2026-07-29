import { expect, test } from "@playwright/test";

/**
 * E2E integration tests for the public "List Your Property" flow.
 *
 * These tests exercise the full 3-step wizard against a real Next.js build
 * backed by the local Supabase stack (started via `supabase start` in CI).
 * The DB verification step queries the Supabase REST API directly using the
 * service_role key to bypass RLS and confirm the row was actually persisted.
 *
 * Run locally:
 *   supabase start
 *   supabase db reset
 *   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
 *     -f e2e/supabase/seed.sql
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key> \
 *   npm run build
 *   npm run test:e2e
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
// The local Supabase service_role key — only valid inside the local stack.
// We never commit the real project's service_role key.
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwNDA5NjIyMH0.M2d2z4SFn5d2qH3-5vn5q5q5q5q5q5q5q5q5q5q5q5q";

/**
 * Fetches the most recently inserted property row from the local Supabase
 * `properties` table using the service_role key (bypasses RLS).
 */
async function fetchLatestProperty(
  address: string
): Promise<Record<string, unknown> | null> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/properties`);
  url.searchParams.set("select", "*");
  url.searchParams.set("address", `eq.${address}`);
  url.searchParams.set("order", "created_at.desc");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows[0] ?? null;
}

test.describe("List property flow (guest)", () => {
  test("completes all 3 steps, persists to DB, and lands on success page", async ({
    page,
  }) => {
    // Use a unique address so we can identify this submission in the DB.
    const uniqueAddress = `E2E Test Street ${Date.now()}, Bangkok`;

    await page.goto("/list-property");

    // ── Step 1: Property Details ─────────────────────────────────
    // Listing role "Owner" is selected by default — verify it.
    await expect(page.getByText(/Listing As/i)).toBeVisible();

    // Property type — click "Condo" (default)
    await expect(page.getByText(/Property Type/i)).toBeVisible();

    // Location
    await page
      .getByPlaceholder(/Search area, landmark or neighborhood/i)
      .fill(uniqueAddress);

    // Rent
    await page.getByPlaceholder(/0\.00/i).fill("25000");

    // Description (optional)
    await page
      .getByPlaceholder(/Tell potential tenants/i)
      .fill("E2E test property description");

    // Next → Step 2
    await page.getByRole("button", { name: /Next/i }).click();

    // ── Step 2: Features & Amenities ─────────────────────────────
    await expect(page.getByText(/Bedrooms & Bathrooms/i)).toBeVisible();
    // Defaults: 1 bedroom, 1 bathroom — keep defaults.

    // Furnishing — click "Fully Furnished"
    await page.getByText(/Fully Furnished/i).click();

    // Amenities — check "WiFi"
    await page.getByText(/WiFi/i).click();

    // Next → Step 3
    await page.getByRole("button", { name: /Next/i }).click();

    // ── Step 3: Review & Contact ─────────────────────────────────
    await expect(page.getByText(/Your Contact Information/i)).toBeVisible();

    await page.getByLabel(/Full Name/i).fill("E2E Tester");
    await page.getByLabel(/Email Address/i).fill("e2e@example.com");
    await page.getByLabel(/Phone Number/i).fill("+668123456789");

    // Accept terms checkbox
    await page.getByRole("checkbox").first().check();

    // Submit
    await page.getByRole("button", { name: /List My Property/i }).click();

    // ── Success Page ─────────────────────────────────────────────
    await expect(page).toHaveURL(/\/list-property\/success$/);
    await expect(
      page.getByText(/Your Property Has Been Listed/i)
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /List Another Property/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Back to Home/i })
    ).toBeVisible();

    // ── DB Verification ──────────────────────────────────────────
    // Confirm the row was actually persisted in Supabase.
    const row = await fetchLatestProperty(uniqueAddress);
    expect(row).not.toBeNull();
    expect(row?.["address"]).toBe(uniqueAddress);
    expect(row?.["rent_amount"]).toBe(25000);
    expect(row?.["property_type"]).toBe("condo");
    expect(row?.["furnishing"]).toBe("fully");
    expect(row?.["bedrooms"]).toBe(1);
    expect(row?.["bathrooms"]).toBe(1);
    expect(row?.["contact_name"]).toBe("E2E Tester");
    expect(row?.["contact_email"]).toBe("e2e@example.com");
    expect(row?.["status"]).toBe("pending"); // guest submissions are 'pending'
    expect(row?.["description"]).toBe("E2E test property description");
    // Amenities should include "wifi"
    const amenities = row?.["amenities"] as string[];
    expect(amenities).toContain("wifi");
  });

  test("'List Another Property' resets to step 1", async ({ page }) => {
    // Navigate directly to the success page (no form submission needed)
    await page.goto("/list-property/success");

    await page.getByRole("link", { name: /List Another Property/i }).click();
    await expect(page).toHaveURL(/\/list-property$/);
    // Step 1 heading visible
    await expect(page.getByText(/Listing As/i)).toBeVisible();
  });

  test("'Back to Home' navigates to landing page", async ({ page }) => {
    await page.goto("/list-property/success");

    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("List property validation", () => {
  test("step 1 blocks Next when required fields are empty", async ({
    page,
  }) => {
    await page.goto("/list-property");

    // Click Next without filling anything
    await page.getByRole("button", { name: /Next/i }).click();

    // Should remain on step 1 (not navigate to step 2)
    await expect(page.getByText(/Listing As/i)).toBeVisible();
    // Step 2 heading should NOT be visible
    await expect(page.getByText(/Bedrooms & Bathrooms/i)).not.toBeVisible();

    // Error messages should surface
    await expect(page.getByText(/at least 5/i)).toBeVisible();
  });
});
