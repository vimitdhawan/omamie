import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "property-images";

/**
 * Storage paths are computed before the property is written, because the image rows need
 * their `storage_path` at insert time. Keeping the `${profileId}/${propertyId}/` prefix is
 * what lets the orphan sweep scope itself to a single listing.
 */
export function buildImagePath(
  profileId: string,
  propertyId: string,
  fileName: string
): string {
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
    : "";
  return `${profileId}/${propertyId}/${crypto.randomUUID()}${extension}`;
}

export async function uploadPropertyImage(
  path: string,
  file: File
): Promise<void> {
  const supabase = createServiceRoleClient();
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function deleteImagePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

export type StorageObject = { name: string; createdAt: string };

/** Lists every object under a prefix, paging through the 100-per-request default. */
export async function listImageObjects(
  prefix: string
): Promise<StorageObject[]> {
  const supabase = createServiceRoleClient();
  const pageSize = 100;
  const objects: StorageObject[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: pageSize, offset });

    if (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    for (const item of data) {
      objects.push({
        name: `${prefix}/${item.name}`,
        createdAt: item.created_at ?? new Date(0).toISOString(),
      });
    }

    if (data.length < pageSize) break;
  }

  return objects;
}
