# Google Social Signup — Setup Steps

Code changes are already implemented (see `enable-social-signup` branch). The
steps below are manual configuration in Google Cloud Console and the
Supabase Dashboard — nothing here can be scripted from the repo.

## 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and select
   or create a project for Omamie.
2. Navigate to **APIs & Services → OAuth consent screen**.
   - Set user type (External, unless using Google Workspace internally).
   - Fill in app name, support email, and authorized domains.
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**.
   - Application type: **Web application**.
   - Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`
     (find `<project-ref>` in your Supabase project settings).
4. Save the generated **Client ID** and **Client Secret**.

## 2. Supabase Dashboard

1. **Authentication → Providers → Google**
   - Toggle it on.
   - Paste the Client ID and Client Secret from step 1.
   - Save.
2. **Authentication → URL Configuration → Redirect URLs**
   - Add your app's callback route for each environment, e.g.:
     - `http://localhost:3000/auth/callback` (local dev)
     - `https://staging.omamie.com/auth/callback`
     - `https://omamie.com/auth/callback`

## 3. Environment Variables

Ensure these are set in each environment (`.env.local`, hosting provider
secrets, etc.):

| Variable                               | Notes                                                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                         | Already required                                                                                                                                                                  |
| `SUPABASE_PUBLISHABLE_KEY`             | Already required                                                                                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_URL`             | Falls back to `SUPABASE_URL` if unset                                                                                                                                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **New** — required for the browser Supabase client used by the Google signup button. Falls back to `SUPABASE_PUBLISHABLE_KEY` if unset, but should be set explicitly for clarity. |

## 4. Apply the DB Migration

Run the new migration against each Supabase project (local, staging, prod):

```bash
supabase db push
```

Migration: `supabase/migrations/20260920100008_default_role_oauth_signup.sql`
— fixes the `handle_new_user()` trigger to default `role` to `'tenant'` when
absent (Google OAuth signups don't carry a `role` in user metadata the way
password signup does). Without this, Google signup fails outright with a
`NOT NULL` constraint violation on `profiles.role`.

## 5. Verify

1. Local dev: `npm run dev`, go to `/signup`, pick **List Property → Agent**
   (or Owner), click **Continue with Google**.
2. Confirm redirect to Google consent screen → back to `/auth/callback` →
   landing page.
3. Check `profiles` table: new row should have `role = 'agent'` (or
   `'owner'`), not `'tenant'`.
4. Repeat with **Find Property** (tenant) path — role should be `'tenant'`.
