import {
  savePropertyRpc,
  finalizePropertyImagesRpc,
  listImagePathsForProperty,
  getPropertyById,
  getPropertiesList,
  getPublishedPropertiesList,
  getPropertiesCountByStatus,
  getPropertiesByIds,
  deletePropertyById,
  getRentedPropertiesMonthlyRevenue,
} from "./repository";
import {
  buildImagePath,
  uploadPropertyImage,
  deleteImagePaths,
  listImageObjects,
} from "./storage";
import {
  schemaForIntent,
  imageFilesSchema,
  type ImageManifestEntry,
} from "./schema";
import type {
  Property,
  PropertyStatus,
  LocationContext,
  Amenity,
} from "./types";
import { isBuildingFacility } from "./types";
import { AppError } from "@/lib/errors";
import { PropertyValidationError } from "./errors";
import { z } from "zod";

export { PropertyValidationError };

/**
 * Service layer for properties
 * Contains business logic and orchestration
 */

/**
 * Objects younger than this are left alone by the sweep: a concurrent save may have just
 * uploaded them, with its image rows not yet committed. Deleting those would corrupt the
 * other request.
 */
const ORPHAN_GRACE_MS = 15 * 60 * 1000;

const UPLOAD_CONCURRENCY = 4;

export type SavePropertyResult = {
  propertyId: string;
  status: PropertyStatus;
  imageWarnings: Array<{ fileName: string; message: string }>;
};

export type SavePropertyValidationError = {
  fieldErrors: Record<string, string[]>;
};

/**
 * Saves the whole listing from a single submission.
 *
 * The ordering matters. The transaction commits first and records new images as "pending";
 * only then are files uploaded, and only then are the rows promoted. A failure after the
 * commit therefore costs at most some photos, never the owner's typed work.
 */
export async function savePropertyListing(
  payload: Record<string, unknown>,
  files: File[],
  profileId: string,
  existing: Property | null
): Promise<SavePropertyResult> {
  const intent = payload.intent === "publish" ? "publish" : "draft";

  const parsed = schemaForIntent(intent).safeParse(payload);
  if (!parsed.success) {
    throw new PropertyValidationError(
      z.flattenError(parsed.error).fieldErrors as Record<string, string[]>
    );
  }

  const filesParsed = imageFilesSchema.safeParse(files);
  if (!filesParsed.success) {
    throw new PropertyValidationError({
      images: z.flattenError(filesParsed.error).formErrors.length
        ? z.flattenError(filesParsed.error).formErrors
        : ["One or more images are not a supported type or are too large"],
    });
  }

  const data = parsed.data;
  const manifest = data.images as ImageManifestEntry[];

  if (manifest.length > 0 && files.length === 0 && hasNewEntries(manifest)) {
    throw new PropertyValidationError({
      images: ["Some images were not received. Please re-add them."],
    });
  }

  const isNew = !existing;
  // Generated here rather than by the database so image paths can be computed before the
  // transaction, and so a retry is idempotent.
  const propertyId = existing?.id ?? crypto.randomUUID();

  // Each manifest entry becomes either a kept row (by id) or a new row (by path).
  const plannedPaths = new Map<number, string>();
  const rpcImages = manifest.map((entry) => {
    if (entry.id) {
      return { id: entry.id, storage_path: null, sort_order: entry.sortOrder };
    }
    const file = files[entry.fileIndex!];
    if (!file) {
      throw new PropertyValidationError({
        images: ["Some images were not received. Please re-add them."],
      });
    }
    const path = buildImagePath(profileId, propertyId, file.name);
    plannedPaths.set(entry.fileIndex!, path);
    return { id: null, storage_path: path, sort_order: entry.sortOrder };
  });

  const publish = intent === "publish";

  // --- 1. the transaction. A throw here means nothing was written and storage is untouched.
  const result = await savePropertyRpc({
    propertyId,
    isNew,
    property: buildPropertyPayload(data, isNew),
    location: buildLocationPayload(data),
    images: rpcImages,
    publish,
  });

  // --- 2. upload the files the transaction reserved rows for.
  const pathToFile = new Map<string, File>();
  for (const [fileIndex, path] of plannedPaths) {
    pathToFile.set(path, files[fileIndex]);
  }

  const uploadedIds: string[] = [];
  const failedIds: string[] = [];
  const imageWarnings: Array<{ fileName: string; message: string }> = [];

  for (let i = 0; i < result.pending.length; i += UPLOAD_CONCURRENCY) {
    const batch = result.pending.slice(i, i + UPLOAD_CONCURRENCY);
    const outcomes = await Promise.allSettled(
      batch.map(async (row) => {
        const file = pathToFile.get(row.storage_path);
        if (!file) throw new Error("File missing for reserved image row");
        await uploadPropertyImage(row.storage_path, file);
      })
    );

    outcomes.forEach((outcome, index) => {
      const row = batch[index];
      if (outcome.status === "fulfilled") {
        uploadedIds.push(row.id);
        return;
      }
      failedIds.push(row.id);
      imageWarnings.push({
        fileName: pathToFile.get(row.storage_path)?.name ?? "image",
        message:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : "Upload failed",
      });
    });
  }

  // --- 3. promote what landed, drop what didn't, and publish if this was a publish.
  //
  // With no rows to resolve there is nothing to finalize: save_property only withholds the
  // publish when it reserved new image rows, so an empty `pending` means it already applied
  // the status itself.
  let status = result.status;
  const stalePaths = [...result.deleted_paths];

  if (result.pending.length > 0) {
    const finalized = await finalizePropertyImagesRpc(
      propertyId,
      uploadedIds,
      failedIds,
      publish
    );
    status = finalized.status;
    stalePaths.push(...finalized.failed_paths);
  }

  if (result.pending.length > 0 || stalePaths.length > 0) {
    await sweepOrphanImages(profileId, propertyId, stalePaths);
  }

  return { propertyId, status, imageWarnings };
}

/**
 * Removes storage objects no row references.
 *
 * Deliberately best-effort: rows are the source of truth, so a leftover object is harmless
 * where a missing one is not. Never allowed to fail the save.
 */
export async function sweepOrphanImages(
  profileId: string,
  propertyId: string,
  knownStalePaths: string[] = []
): Promise<void> {
  try {
    if (knownStalePaths.length > 0) {
      await deleteImagePaths(knownStalePaths);
    }

    const livePaths = new Set(await listImagePathsForProperty(propertyId));
    const objects = await listImageObjects(`${profileId}/${propertyId}`);
    const cutoff = Date.now() - ORPHAN_GRACE_MS;

    const orphans = objects
      .filter((object) => !livePaths.has(object.name))
      .filter((object) => new Date(object.createdAt).getTime() < cutoff)
      .map((object) => object.name);

    if (orphans.length > 0) {
      await deleteImagePaths(orphans);
    }
  } catch (error) {
    console.error("Failed to sweep orphaned property images:", error);
  }
}

/** Deletes the listing, then every object under its storage prefix. */
export async function deleteProperty(
  propertyId: string,
  profileId: string
): Promise<void> {
  await deletePropertyById(propertyId);

  try {
    const objects = await listImageObjects(`${profileId}/${propertyId}`);
    await deleteImagePaths(objects.map((object) => object.name));
  } catch (error) {
    console.error("Failed to delete property images from storage:", error);
  }
}

export async function getProperty(id: string): Promise<Property | null> {
  return await getPropertyById(id);
}

export async function listProperties(
  profileId: string,
  filters?: Parameters<typeof getPropertiesList>[1]
): Promise<Property[]> {
  return await getPropertiesList(profileId, filters);
}

/** Active listings for the tenant explore grid — see `getPublishedPropertiesList`. */
export async function listPublishedProperties(
  filters?: Parameters<typeof getPublishedPropertiesList>[0]
): Promise<Property[]> {
  return await getPublishedPropertiesList(filters);
}

/** Properties by id for the tenant "Saved" grid — see `getPropertiesByIds`. */
export async function listPropertiesByIds(ids: string[]): Promise<Property[]> {
  return await getPropertiesByIds(ids);
}

export async function countPropertiesByStatus(profileId: string) {
  return await getPropertiesCountByStatus(profileId);
}

/** Recurring revenue proxy for the owner dashboard — see repository for caveats. */
export async function getRentedPropertiesRevenue(
  profileId: string
): Promise<number> {
  return await getRentedPropertiesMonthlyRevenue(profileId);
}

/** Throws unless the property exists and belongs to the caller. */
export async function assertCanEditProperty(
  propertyId: string,
  profileId: string
): Promise<Property> {
  const property = await getPropertyById(propertyId);

  if (!property) {
    throw new AppError("NOT_FOUND", "Property not found");
  }
  if (property.profileId !== profileId) {
    throw new AppError(
      "FORBIDDEN",
      "You do not have permission to edit this property"
    );
  }

  return property;
}

function hasNewEntries(manifest: ImageManifestEntry[]): boolean {
  return manifest.some((entry) => entry.id === null);
}

/**
 * Only keys the form actually carried are sent, so a partial draft save never clears a field
 * the owner did not touch. On create everything is sent, defaults included.
 */
function buildPropertyPayload(
  data: Record<string, unknown>,
  isNew: boolean
): Record<string, unknown> {
  const mapping: Array<[string, string]> = [
    ["title", "title"],
    ["propertyType", "property_type"],
    ["location", "location"],
    ["monthlyRent", "monthly_rent"],
    ["description", "description"],
    ["bedrooms", "bedrooms"],
    ["bathrooms", "bathrooms"],
    ["furnishedStatus", "furnished_status"],
    ["securityDepositMonths", "security_deposit_months"],
    ["availableFrom", "available_from"],
    ["areaSqm", "area_sqm"],
    ["floorNumber", "floor_number"],
    ["totalFloors", "total_floors"],
    ["minimumLeaseMonths", "minimum_lease_months"],
  ];

  const payload: Record<string, unknown> = {};
  for (const [domainKey, columnKey] of mapping) {
    if (data[domainKey] !== undefined || isNew) {
      payload[columnKey] = data[domainKey] ?? null;
    }
  }

  const amenities = (data.amenities ?? []) as Amenity[];
  payload.amenities = amenities;

  // The building name resolves to a row in the shared condo registry inside the same
  // transaction. Only send the key when the form carried it, so a partial save cannot
  // unlink a listing from its building.
  if (data.buildingName !== undefined || isNew) {
    const name =
      typeof data.buildingName === "string" ? data.buildingName.trim() : "";
    payload.condo_name = name === "" ? null : name;

    // Building-level amenities seed the registry, so the next listing in the same block
    // can inherit them. They stay on the property too — a listing must describe itself
    // even when no condo is linked.
    if (name !== "") {
      payload.condo_facilities = amenities.filter(isBuildingFacility);
    }
  }

  return payload;
}

function buildLocationPayload(
  data: Record<string, unknown>
): Record<string, unknown> | null {
  if (data.latitude === undefined || data.longitude === undefined) return null;

  let context: LocationContext = {};
  if (typeof data.locationContext === "string") {
    try {
      context = JSON.parse(data.locationContext) as LocationContext;
    } catch {
      // A malformed context only costs the enrichment fields, not the coordinates.
    }
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    address_line_1: data.location ?? null,
    address_line_2: data.buildingName ?? null,
    city: context.city ?? null,
    district: context.district ?? null,
    state: context.state ?? null,
    postal_code: context.postalCode ?? null,
    country: context.country ?? null,
    country_code: context.countryCode ?? null,
    provider: context.provider ?? null,
    provider_place_id: context.providerPlaceId ?? null,
  };
}
