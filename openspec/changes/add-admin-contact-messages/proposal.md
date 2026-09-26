## Why

Anyone can submit the public contact form, but no one at Omamie can ever see those submissions today — `contact_messages` is insert-only and there is no admin surface for it. Contact requests are silently going unread and unanswered.

## What Changes

- Add a `status` (open/completed), `resolution_note`, `resolved_at`, `resolved_by` to `contact_messages`.
- Add a **Contact Messages** page to the admin sidebar showing all open messages by default.
- Let an admin open a message, read the full body, and mark it completed with a required resolution note (one-way; no reopen).
- Let an admin view completed messages within an explicit date range, capped at a 3-month span per query.

## Impact

- Affected specs: `admin-contact-messages` (new capability)
- Affected code: `supabase/migrations/`, `src/features/admin/contact-messages/` (new), `src/app/(protected)/@admin/contact-messages/` (new), `src/proxy.ts`, `src/features/admin/sidebar/components/app-sidebar.tsx`, `src/features/admin/sidebar/components/site-header.tsx`
