import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "property-images";

export async function uploadPropertyImage(
  profileId: string,
  propertyId: string,
  file: File
): Promise<string> {
  const supabase = createServiceRoleClient();
  const fileName = `${crypto.randomUUID()}-${file.name}`;
  const filePath = `${profileId}/${propertyId}/${fileName}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return filePath;
}

export async function deleteImagePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}
