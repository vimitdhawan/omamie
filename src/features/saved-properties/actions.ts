"use server";

import { revalidatePath } from "next/cache";
import { toggleSaveProperty, getMySavedProperties } from "./service";
import { savePropertySchema } from "./schema";
import type { ActionResult } from "@/types/actions";
import type { SavedProperty } from "./types";
import { isAppError } from "@/lib/errors";

/**
 * Toggle save status for a property
 */
export async function toggleSavePropertyAction(
  propertyId: string
): Promise<ActionResult<{ isSaved: boolean; message: string }>> {
  try {
    const validationResult = savePropertySchema.safeParse({ propertyId });

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid property ID",
      };
    }

    const result = await toggleSaveProperty(propertyId);

    // Revalidate relevant paths
    revalidatePath("/browse-properties");
    revalidatePath("/saved");
    revalidatePath(`/browse-properties/${propertyId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to save property. Please try again.",
    };
  }
}

/**
 * Get all saved properties for current user
 */
export async function getMySavedPropertiesAction(): Promise<
  ActionResult<SavedProperty[]>
> {
  try {
    const savedProperties = await getMySavedProperties();

    return {
      success: true,
      data: savedProperties,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to load saved properties. Please try again.",
    };
  }
}
