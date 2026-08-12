# Coding Agent Guidelines (Antigravity, Claude, OpenCode)

Welcome! This file coordinates agent behavior across different AI tooling environments to accelerate feature development. It acts as the single source of truth for project details, styling, and architectural rules.

---

## 1. Project Goal & Features

This application acts as the backend and frontend skeleton for **Omamie — a property management platform**. It supports:

- **Tenants** searching for properties based on size (sqm), room count, pet-friendliness, and location.
- **Owners and Agents** onboarding and managing properties.

---

## 2. Tech Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Base UI primitives), next-themes
- **Database**: Supabase SSR (Server client only, cookie management)
- **Forms & Validation**: React Hook Form, Zod
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

_Do NOT install state management libraries (Zustand, Redux, etc.) or TanStack Query. The application primarily uses Server Components and Server Actions._

---

## 3. Directory Layout

The project uses a strict feature-based layout:

```text
src/
├── app/                       # Next.js App Router (Public and Dashboard route groups)
├── components/                # Shared global components
│   └── ui/                    # shadcn/ui base elements
├── features/                  # Feature modules
│   ├── auth/                  # Authentication module
│   ├── properties/            # Property listings, searches, and management
│   ├── requirements/          # Tenant room/search criteria requirements
│   ├── users/                 # User profiles, agent/tenant management
│   └── dashboard/             # Agent/Owner dashboards
├── hooks/                     # Custom shared React hooks
├── lib/                       # Common libraries and helpers
│   ├── supabase/              # Supabase server clients and middleware configuration
│   ├── utils/                 # Utility helper functions
│   └── validations/           # Zod environment schema validations
├── styles/                    # Global stylesheets
└── types/                     # Shared TypeScript types
```

---

## 4. Shared Architecture Rules

Ensure proper division of concerns when writing application logic.

### Blueprint Checklist for Features

When generating or modifying a feature (`src/features/<feature_name>/`), adhere strictly to this file structure and layer boundary guidelines:

| File            | Purpose                                  | Allowed Imports              | Forbidden Imports          |
| :-------------- | :--------------------------------------- | :--------------------------- | :------------------------- |
| `repository.ts` | Direct DB queries                        | `@/lib/supabase/server`      | `service.ts`, `actions.ts` |
| `service.ts`    | Business logic & Orchestration           | `repository.ts`, `schema.ts` | `actions.ts`               |
| `actions.ts`    | Server Actions (API endpoint equivalent) | `service.ts`, `schema.ts`    | `repository.ts`            |
| `schema.ts`     | Zod validation schemas                   | `zod`                        | Any execution/logic file   |
| `types.ts`      | Feature-specific types                   | TypeScript interfaces        | Any execution/logic file   |
| `utils.ts`      | Feature-specific utility helpers         | Helper modules               | Large external modules     |

### 🚫 Anti-Patterns to Avoid

- **No Inline Queries**: Never query the database directly in Server Actions or React components. All database operations MUST go through the feature's `repository.ts` file.
- **No Direct Repositories in Actions**: Server Actions (`actions.ts`) must call the feature's `service.ts`, never `repository.ts` directly. The Service layer is responsible for validating permissions and rules.
- **No Browser-Side Supabase Clients**: Client-side auth screens or direct database calls from the browser are forbidden. Keep authentication and data access on the server.

---

## 5. Next.js 16 Development Best Practices

### Asynchronous APIs

Next.js 16 makes dynamic APIs asynchronous. Be sure to use:

- `await cookies()` (instead of synchronous calls)
- `await headers()`
- `await params` or `await searchParams` in pages/layouts

### Proxying and Intercepting

- Intercept logic belongs in `src/proxy.ts`. Do not use `middleware.ts` (deprecated in Next.js 16).

---

## 6. Shared Development Flow

To prevent linting conflicts, compilation errors, and Git merge issues, all agents must adhere to the following sequence:

1. **Linting Check**: Always verify formatting and TypeScript compilation before finishing a task:
   ```bash
   npm run lint
   ```
2. **Build Validation**: Verify Next.js routes compile cleanly under production conditions:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run build
   ```
3. **Pre-commit Integrity**: Commit hooks are set up via Husky and lint-staged. When modifying files, make sure to format with Prettier to avoid hook failures.
4. **Test Verification**: New features or bug fixes MUST be accompanied by tests (see §7). Run the relevant tests before declaring a task complete:
   ```bash
   npm run test           # unit + component (Vitest)
   npm run test:e2e       # end-to-end (Playwright, needs local Supabase stack)
   ```

---

## 7. Testing Strategy

The project uses a two-layer testing stack aligned with the Next.js 16 / React 19 architecture:

| Layer        | Tool                                       | Purpose                                                                |
| :----------- | :----------------------------------------- | :--------------------------------------------------------------------- |
| Unit / Comp. | **Vitest** + React Testing Library + JSDOM | Pure logic (`schema.ts`, `service.ts`, `utils.ts`) + client components |
| End-to-End   | **Playwright** + **local Supabase stack**  | User flows against a real `next build` + real DB / auth                |

### 7.1 Directory Layout

```
src/features/<name>/__tests__/         # co-located unit/component tests
  *.test.ts                              # logic (schema, service, utils, actions)
  *.test.tsx                             # component tests (RTL)

src/lib/__mocks__/                       # centralized mocks (shared across all features)
  supabase.ts                            # Supabase client mock with error mapping
  test-utils.ts                          # mock data creators & assertion helpers

src/lib/__tests__/
  *.test.ts                              # lib-layer tests (errors, validations)

e2e/
  *.spec.ts                              # Playwright specs

vitest.config.ts                         # Vitest configuration
vitest.setup.ts                          # RTL jest-dom + next/* mocks
playwright.config.ts                     # Playwright configuration
```

### 7.2 NPM Scripts

```bash
npm run test                # vitest run (one-shot)
npm run test:watch          # vitest in watch mode
npm run test:coverage       # vitest run + v8 coverage report (no thresholds enforced)
npm run test:e2e            # playwright test (requires `next build` + Supabase stack)
npm run test:e2e:ui         # playwright interactive UI mode for local debugging
```

### 7.3 Unit Test Conventions

- **Layer to test**: `service.ts`, `utils.ts`, `schema.ts`, `repository.ts`, and `actions.ts`. Use Arrange-Act-Assert pattern.
- **Centralized mocks**: Import mock clients from `@/lib/__mocks__/supabase.ts` and utilities from `@/lib/__mocks__/test-utils.ts`. These are shared across all features.
- **Mock pattern**: Use `vi.hoisted()` to build mocks at module level, then `vi.mock("@/lib/supabase/server", () => ({ createClient: mockFactory }))`. See `src/features/auth/__tests__/repository.test.ts` for the canonical pattern.
- **Actions tests**: Test error handling (AppError vs generic errors) and form validation state. Use `vi.mock()` for `next/navigation` redirect and service layer dependencies.
- **Co-locate tests** under `src/features/<name>/__tests__/`. Filename suffix: `*.test.ts(x)`.
- **Async Server Components** are not unit-tested. Cover them with Playwright instead (per Next.js docs guidance).

### 7.4 E2E Test Conventions

- **Local Supabase**: E2E tests target the local Supabase stack started via the Supabase CLI. The `webServer` block runs `npm run start` against the production build; CI is responsible for running `supabase start` + `supabase db reset` before the tests execute.
- **Seed**: deterministic credentials live in `e2e/supabase/seed.sql`. `supabase db reset` only loads `supabase/seed.sql` (dev-time placeholder), so the E2E seed is applied via an explicit `psql -f e2e/supabase/seed.sql` step in CI. When running E2E locally, execute the same `psql` command manually after `db reset`. Never commit real Supabase project credentials.
- **Smoke vs flow**: pure smoke tests (home page, login form rendering) live in `home.spec.ts` and `auth.spec.ts` and don't depend on Supabase being seeded. Full authenticated flows belong in their own specs and assume the seed is applied.
- **Environment for build**: when running E2E locally, build with the local API URL inlined:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key> \
  npm run build
  npm run test:e2e
  ```

### 7.5 CI

- **`quality-and-build`** → lint + type-check + `next build`.
- **`unit-tests`** → `npm run test:coverage` and uploads the coverage report artifact.
- **`e2e-tests`** → installs Supabase CLI, starts the local stack, resets the DB (loads migrations + dev placeholder seed), applies the E2E seed via `psql -f e2e/supabase/seed.sql`, builds Next.js with the local API URL, runs `npm run test:e2e`, uploads the Playwright report artifact, then tears down the stack.
- All three jobs run on every PR and every push to `main`/`master`. Branch protection should require all three to pass before merge.

<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
