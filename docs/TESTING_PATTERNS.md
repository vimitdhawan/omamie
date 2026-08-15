# Testing Patterns & Conventions

This document outlines the testing patterns and conventions used in this project for both unit and E2E tests.

## Directory Structure

```
src/
├── lib/
│   ├── __tests__/
│   │   └── errors.test.ts
│   └── errors.ts
├── features/
│   └── auth/
│       ├── __tests__/
│       │   ├── repository.test.ts
│       │   ├── service.test.ts
│       │   ├── actions.test.ts
│       │   └── schema.test.ts
│       ├── repository.ts
│       ├── service.ts
│       ├── actions.ts
│       └── schema.ts
e2e/
├── auth-signup.spec.ts
├── auth-login.spec.ts
└── home.spec.ts
```

## Unit Tests (Vitest)

### Location

- Tests live in `__tests__/` subdirectories next to implementation files
- File naming: `<module>.test.ts`

### Pattern: Arrange-Act-Assert

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { functionUnderTest } from "../module";

describe("ModuleName", () => {
  beforeEach(() => {
    // Setup - runs before each test
    vi.clearAllMocks();
  });

  it("should do something specific when condition is met", () => {
    // Arrange - prepare test data
    const input = { key: "value" };

    // Act - execute the function
    const result = functionUnderTest(input);

    // Assert - verify the result
    expect(result).toBe(expectedValue);
  });
});
```

### Key Conventions

1. **Descriptive names**: Test names clearly describe behavior, not implementation
   - ✅ `should throw CONFLICT error on duplicate email`
   - ❌ `test duplicate key error`

2. **Simple assertions**: One logical assertion per test
   - ✅ `expect(error.code).toBe("CONFLICT")`
   - ❌ Multiple unrelated assertions in one test

3. **Parameterized tests**: Use `.each()` for similar scenarios

   ```typescript
   it.each([
     ["invalid-email", false],
     ["valid@example.com", true],
   ])("validates email %s", (email, expected) => {
     expect(validateEmail(email)).toBe(expected);
   });
   ```

4. **Mocking**: Centralized in vitest.setup.ts, use vi.mock() for dependencies
   ```typescript
   vi.mock("@/lib/supabase/server");
   // Then use:
   vi.mocked(supabase.createClient).mockResolvedValue({...});
   ```

### Example: Unit Test for AppError

```typescript
describe("AppError", () => {
  it("should create error with code and statusCode", () => {
    const error = new AppError("CONFLICT", "Email exists", 409);

    expect(error.code).toBe("CONFLICT");
    expect(error.statusCode).toBe(409);
  });
});
```

## E2E Tests (Playwright)

### Location

- Tests live in `e2e/` directory
- File naming: `<feature>.spec.ts`

### Pattern: Arrange-Act-Assert

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should perform action and show expected result", async ({ page }) => {
    // Arrange - navigate to page
    await page.goto("/route");

    // Act - interact with elements
    await page.getByLabel(/Label/i).fill("value");
    await page.getByRole("button", { name: /Button/i }).click();

    // Assert - verify result
    await expect(page.getByText(/Success/i)).toBeVisible();
  });
});
```

### Key Conventions

1. **User perspective**: Test from the user's view, not implementation details
   - ✅ `form validation error appears on blur`
   - ❌ `handleBlur() calls setError()`

2. **Selector patterns**: Use role-based selectors when possible

   ```typescript
   // ✅ Preferred
   page.getByRole("button", { name: /Click me/i });
   page.getByLabel(/Email/i);
   page.getByText(/Welcome/i);

   // ⚠️ Avoid
   page.locator("#submit-btn");
   page.locator(".form-field:first-child");
   ```

3. **Wait for assertions**: Always await expect() for visibility

   ```typescript
   await expect(page.getByText(/Error/i)).toBeVisible();
   ```

4. **Realistic workflows**: Test complete user journeys
   - Fill form → Submit → Verify result
   - Navigate → Interact → Assert

### Example: E2E Test for Signup

```typescript
test("displays validation error on invalid email", async ({ page }) => {
  // Arrange
  await page.goto("/signup");

  // Act
  await page.getByLabel(/Email/i).fill("invalid-email");
  await page.getByLabel(/Email/i).blur();

  // Assert
  await expect(page.getByText(/valid email/i)).toBeVisible();
});
```

## Running Tests

### Unit Tests

```bash
# All unit tests
npm run test

# Specific module
npm run test -- src/features/auth

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Requires running app (npm run dev)
npm run test:e2e

# With UI
npm run test:e2e -- --ui

# Specific spec file
npm run test:e2e -- auth-signup
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)

- Environment: jsdom (browser-like)
- Globals: true (no need to import describe/it/expect)
- Setup files: vitest.setup.ts
- Include: `src/**/*.test.ts(x)`
- Coverage: v8 provider

### Playwright Config (`playwright.config.ts`)

- Test dir: `e2e/`
- Base URL: `http://127.0.0.1:3000`
- Workers: 1 in CI, parallel locally
- Retries: 2 in CI, 0 locally
- Traces: Retained on failure

### Setup File (`vitest.setup.ts`)

- Auto cleanup after each test
- Mocks next/navigation
- Mocks next/headers
- React Testing Library ready

## Best Practices

### ✅ Do

- **Name tests descriptively**: Future you will appreciate it
- **Test user workflows**: What matters to end users
- **Keep tests isolated**: No dependencies between tests
- **Mock external dependencies**: Supabase, APIs, etc.
- **Use meaningful data**: Real email formats, actual user scenarios
- **Verify one thing per test**: Clear pass/fail signal
- **Use beforeEach/afterEach**: Setup and cleanup once per test

### ❌ Don't

- **Test implementation details**: Test behavior, not code structure
- **Chain too many actions**: Keep workflows focused
- **Use generic selectors**: Avoid nth-child, css class selectors
- **Ignore test failures**: Fix immediately, don't skip
- **Create shared test data**: Use factories or builders per test
- **Sleep in tests**: Use waitFor and expects instead

## Coverage Goals

| Type                | Target | Checked By |
| ------------------- | ------ | ---------- |
| Errors              | 100%   | Unit tests |
| Repository          | 100%   | Unit tests |
| Service             | 100%   | Unit tests |
| Actions             | 95%+   | Unit tests |
| Critical user paths | E2E    | Playwright |

Run `npm run test:coverage` to check coverage reports.

## Common Patterns

### Testing Error Handling

```typescript
it("should throw AppError on failure", async () => {
  vi.mocked(supabase).mockRejectedValue(someError);

  await expect(functionUnderTest()).rejects.toThrow(AppError);
});
```

### Testing Form Validation

```typescript
it("should show error message on blur with invalid input", async ({ page }) => {
  const input = page.getByLabel(/Field/i);
  await input.fill("invalid");
  await input.blur();

  await expect(page.getByText(/error message/i)).toBeVisible();
});
```

### Testing Success Paths

```typescript
it("should redirect on successful action", async ({ page }) => {
  // Fill valid data and submit
  await page.getByLabel(/Email/i).fill("valid@example.com");
  await page.getByRole("button", { name: /Submit/i }).click();

  // Verify redirect
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Troubleshooting

### Tests fail with "Cannot find module"

- Check vi.mock() path matches actual module location
- Vitest uses actual module resolution, not babel aliases sometimes

### E2E tests fail: "page.goto() timeout"

- Ensure `npm run dev` is running
- Check BASE_URL in playwright.config.ts matches your setup

### Tests pass locally but fail in CI

- Check NODE_ENV and environment variables
- Ensure mocks work the same in both environments

### Flaky tests (intermittent failures)

- Avoid timeouts, use `await expect(...).toBeVisible()`
- Don't hard-code waits, use `waitForTimeout()` as last resort
- Ensure tests don't depend on timing

## Adding New Tests

1. **Identify what to test**: Feature, bug fix, edge case?
2. **Choose test type**: Unit (behavior) or E2E (workflow)?
3. **Create in right location**: `__tests__/` for unit, `e2e/` for E2E
4. **Follow naming pattern**: Module name matches file name
5. **Write Arrange-Act-Assert**: Clear, readable structure
6. **Run and verify**: `npm run test -- <path-to-test>`
7. **Check coverage**: Ensure new code is covered

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
