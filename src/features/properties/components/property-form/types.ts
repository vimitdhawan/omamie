import { getPublicImageUrl } from "@/lib/storage-url";
import type { PropertyImage } from "../../types";

/**
 * An image in the form: either one already saved (identified by its row id) or one the owner
 * just picked (a File not yet uploaded). Ordering is the array order.
 */
export type DraftImage =
  | { kind: "saved"; id: string; storagePath: string }
  | { kind: "new"; key: string; file: File; previewUrl: string };

export function draftImageKey(image: DraftImage): string {
  return image.kind === "saved" ? image.id : image.key;
}

export function draftImageSrc(image: DraftImage): string {
  return image.kind === "saved"
    ? getPublicImageUrl(image.storagePath)
    : image.previewUrl;
}

export function toDraftImages(images: PropertyImage[]): DraftImage[] {
  return images.map((image) => ({
    kind: "saved" as const,
    id: image.id,
    storagePath: image.storagePath,
  }));
}
