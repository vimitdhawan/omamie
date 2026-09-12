export function getPublicImageUrl(path: string): string {
  // Back-compat: if already a full URL (from earlier testing), return as-is
  if (path.startsWith("http")) {
    return path;
  }

  // Construct the public URL from the storage path
  // NOTE: NEXT_PUBLIC_SUPABASE_URL must be set in .env/.env.local
  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!baseUrl) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL not set — image URLs may not resolve"
    );
    return "";
  }

  return `${baseUrl}/storage/v1/object/public/property-images/${path}`;
}
