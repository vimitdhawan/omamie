# Omamie

A clean, production-ready foundation for the Omamie property management platform built with Next.js, Tailwind CSS, TypeScript, and Supabase SSR.

## Goal & Architecture

This application acts as the backend and frontend skeleton for the Omamie property management system. It supports:

- **Tenants** searching for properties based on size, room count, pet-friendliness, and location.
- **Owners and Agents** onboarding and managing properties.

### Folder Structure & Feature-Based Architecture

The project uses a strict feature-based layout inside `src/features/`. Each feature contains isolated subfolders and files to ensure decoupling and clear division of responsibilities:

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

### Feature Responsibilities

Within each feature directory (`src/features/<feature-name>/`), the following files must house their respective layer logic:

- `repository.ts`: Pure database access layer (e.g. `getPropertyById`, `createProperty`). No business logic.
- `service.ts`: Core business logic (validation rules, permission checks, orchestration between repositories).
- `actions.ts`: Next.js Server Actions that serve as entrypoints for form submissions and user interactions.
- `schema.ts`: Zod validation schemas.
- `types.ts`: Feature-specific TypeScript type definitions.
- `utils.ts`: Small utility helpers scoped only to this feature.
- `components/`: UI components unique to this feature.

---

## Tech Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui, next-themes
- **Database**: Supabase SSR (Server client only, cookie management)
- **Forms & Validation**: React Hook Form, Zod
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

---

## Project Setup

### 1. Prerequisites

Ensure you have Node.js 18+ and npm installed on your machine.

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the `.env.example` file to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> [!IMPORTANT]
> The application uses Zod to strictly validate environment variables at startup/build time. It will throw an error if these variables are missing or misconfigured.

### 4. Running the App

Run the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Code Quality & Git Hooks

This project enforces strict code style guidelines automatically using Git Hooks:

- **Linting & Formatting**: On commit, `husky` runs `lint-staged` which uses Next Lint and Prettier to format and lint typescript and CSS code.
- **Strict TypeScript**: TypeScript is configured with `"strict": true` and ESLint prohibits `any` usage.

To run linting manually:

```bash
npm run lint
```

To format code manually:

```bash
npx prettier --write .
```
