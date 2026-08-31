import type { SavedProperty } from "./types";
import {
  saveProperty as repoSaveProperty,
  unsaveProperty as repoUnsaveProperty,
  getSavedPropertiesByUser,
  isPropertySaved,
} from "./repository";
import { getAuthSession } from "@/lib/auth-session";
import { AppError } from "@/lib/errors";

/**
 * Service layer for saved properties
 * Contains business logic and orchestration
 */

/**
 * Toggle save status for a property
 * If property is saved, unsave it. If not saved, save it.
 */
export async function toggleSaveProperty(propertyId: string): Promise<{
  isSaved: boolean;
  message: string;
}> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError(
      "UNAUTHORIZED",
      "You must be logged in to save properties"
    );
  }

  const saved = await isPropertySaved(session.profileId, propertyId);

  if (saved) {
    await repoUnsaveProperty(session.profileId, propertyId);
    return {
      isSaved: false,
      message: "Property removed from saved list",
    };
  } else {
    await repoSaveProperty(session.profileId, propertyId);
    return {
      isSaved: true,
      message: "Property saved successfully",
    };
  }
}

/**
 * Get all saved properties for current user
 */
export async function getMySavedProperties(): Promise<SavedProperty[]> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError("UNAUTHORIZED", "You must be logged in");
  }

  return await getSavedPropertiesByUser(session.profileId);
}

/**
 * Check if property is saved by current user
 */
export async function checkPropertySaved(propertyId: string): Promise<boolean> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    return false;
  }

  return await isPropertySaved(session.profileId, propertyId);
}
