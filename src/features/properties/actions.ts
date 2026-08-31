"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  basicInfoSchema,
  amenitiesSchema,
  reviewSchema,
  type PropertyActionState,
} from "./schema";
import {
  saveBasicInfo,
  saveAmenities,
  publishProperty,
  getProperty,
} from "./service";
import { getAuthSession } from "@/lib/auth-session";
import { isAppError } from "@/lib/errors";

/**
 * Submit basic property details (Step 1)
 * Creates a new property with status "pending" or updates existing
 * Sets next_action to "amenities"
 */
export async function submitBasicDetailsAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  const validationResult = basicInfoSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      return {
        errorMessage: "Profile not found. Please log in again.",
      };
    }

    if (session.role !== "agent" && session.role !== "owner") {
      return {
        errorMessage: "Only agents and owners can list properties",
      };
    }

    const propertyId = formData.get("propertyId") as string | null;
    const property = await saveBasicInfo(
      validationResult.data,
      session.profileId,
      propertyId || undefined
    );

    // If creating new property, redirect to edit page
    if (!propertyId) {
      redirect(`/properties/${property.id}`);
    }

    return {
      success: true,
      errorMessage: undefined,
    };
  } catch (error) {
    // NEXT_REDIRECT is thrown by redirect() - let it propagate to Next.js runtime
    if (error instanceof Error && error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage: "Failed to save property details. Please try again.",
    };
  }
}

/**
 * Submit amenities & features (Step 2)
 * Updates property with furnished status, amenities
 * Sets next_action to "review"
 * Only saves if changes detected
 */
export async function submitAmenitiesAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  const data = Object.fromEntries(formData);
  const amenitiesArray = formData.getAll("amenities") as string[];
  const uniqueAmenities = [...new Set(amenitiesArray)] as string[];

  const validationResult = amenitiesSchema.safeParse({
    furnishedStatus: data.furnishedStatus,
    amenities: uniqueAmenities,
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const propertyId = data.propertyId as string;
    if (!propertyId) {
      return { errorMessage: "Property ID is required" };
    }

    // Fetch current property to check for changes
    const currentProperty = await getProperty(propertyId);
    if (!currentProperty) {
      return { errorMessage: "Property not found" };
    }

    const hasChanged =
      currentProperty.furnishedStatus !==
        validationResult.data.furnishedStatus ||
      JSON.stringify(currentProperty.amenities?.sort()) !==
        JSON.stringify(validationResult.data.amenities.sort());

    // Only save if changes detected
    if (hasChanged) {
      await saveAmenities(validationResult.data, propertyId);
    }

    return {
      success: true,
    };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage: "Failed to save property amenities. Please try again.",
    };
  }
}

/**
 * Submit review & confirm (Step 3)
 * Verifies terms acceptance and accuracy confirmation
 * Changes property status to "active" and next_action to "completed"
 * Redirects to success page
 */
export async function submitReviewAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  const validationResult = reviewSchema.safeParse({
    acceptTerms: formData.get("acceptTerms") === "on",
    confirmAccuracy: formData.get("confirmAccuracy") === "on",
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const propertyId = formData.get("propertyId") as string;
    if (!propertyId) {
      return { errorMessage: "Property ID is required" };
    }

    await publishProperty(propertyId);

    revalidatePath("/properties");

    return {
      success: true,
      errorMessage: undefined,
    };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage: "Failed to submit property listing. Please try again.",
    };
  }
}
