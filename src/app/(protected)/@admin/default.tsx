// The parent layout always picks exactly one of @tenant / @owner / @admin and discards
// the others, so this slot's fallback is never actually shown to a user. Per the Next.js
// parallel routes convention, a slot with nothing meaningful to render for the current URL
// returns null rather than a full page.
export default function AdminDefault() {
  return null;
}
