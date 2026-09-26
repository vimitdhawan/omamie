## 1. Database

- [x] 1.1 Add migration for `status`, `resolution_note`, `resolved_at`, `resolved_by` on `contact_messages`
- [x] 1.2 Regenerate Supabase types (`npm run gen:types`)

## 2. Feature layer (`src/features/admin/contact-messages/`)

- [x] 2.1 `types.ts`
- [x] 2.2 `repository.ts` — list (open / completed+range), mark-completed (one-way guard)
- [x] 2.3 `schema.ts` — completion schema, 3-month range schema
- [x] 2.4 `service.ts` — `requireAdmin()` guarded
- [x] 2.5 `actions.ts` — complete action, fetch-completed-range action

## 3. UI

- [x] 3.1 `@admin/contact-messages/page.tsx`
- [x] 3.2 Table + columns components (open/completed tabs, date-range picker)
- [x] 3.3 Row-click detail dialog with completion form

## 4. Wiring

- [x] 4.1 `src/proxy.ts` route entry
- [x] 4.2 Sidebar nav entry
- [x] 4.3 Site header title map entry

## 5. Tests

- [x] 5.1 `schema.test.ts`
- [x] 5.2 `service.test.ts`
- [x] 5.3 `actions.test.ts`

## 6. Verification

- [x] 6.1 `npm run lint`
- [x] 6.2 `npm run test`
- [x] 6.3 `npm run build` (with dummy Supabase env)
