import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Playwright configuration for Omamie.
 *
 * E2E tests run against a real Next.js build served by `next start`.
 * The webServer hook starts the app, and CI scripts are responsible for
 * starting `supabase start` (local stack) before tests run.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    // NOTE: NEXT_PUBLIC_* env must be present at `next build` time (they're
    // inlined into the client bundle). The webServer block does not re-build.
  },
});
