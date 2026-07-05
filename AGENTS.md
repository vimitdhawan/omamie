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
