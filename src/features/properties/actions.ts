"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  basicInfoSchema,
  amenitiesSchema,
  reviewSchema,
  type PropertyActionState,
  type BasicDetailsData,
} from "./schema";
import {
  saveBasicInfo,
  saveAmenities,
  saveImages,
  publishProperty,
  getProperty,
} from "./service";
import { uploadPropertyImage, deleteImagePaths } from "./storage";
import { getAuthSession } from "@/lib/auth-session";
import { isAppError } from "@/lib/errors";
import { getPropertiesList } from "./repository";
import type {
  PropertyStatus,
  PropertyType,
  Property,
  LocationContext,
} from "./types";
import type { LocationSuggestion } from "./components/location-autocomplete";

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

/**
 * Enrich location with postal code and district via reverse geocoding
 */
export async function fetchLocationEnrichmentAction(
  longitude: number,
  latitude: number
): Promise<{ postalCode?: string; district?: string }> {
  if (!MAPBOX_TOKEN) {
    return {};
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=postcode,district&country=TH`;

    const response = await fetch(url);
    if (!response.ok) {
      return {};
    }

    interface MapboxFeature {
      id: string;
      text: string;
    }

    interface MapboxReverseResponse {
      features?: MapboxFeature[];
    }

    const data: MapboxReverseResponse = await response.json();
    const features = data.features || [];

    const enrichment: { postalCode?: string; district?: string } = {};
    for (const feature of features) {
      const [key] = feature.id.split(".");
      if (key === "postcode") {
        enrichment.postalCode = feature.text;
      } else if (key === "district") {
        enrichment.district = feature.text;
      }
    }

    return enrichment;
  } catch (error) {
    console.error("Failed to enrich location:", error);
    return {};
  }
}

/**
 * Fetch location suggestions from Mapbox API (server-side, secure)
 */
export async function fetchLocationSuggestionsAction(
  query: string
): Promise<LocationSuggestion[]> {
  if (!query.trim()) {
    return [];
  }

  if (!MAPBOX_TOKEN) {
    console.error("MAPBOX_TOKEN not configured");
    return [];
  }

  if (!MAPBOX_TOKEN.startsWith("pk_") && !MAPBOX_TOKEN.startsWith("pk.")) {
    console.error(
      "MAPBOX_TOKEN format invalid. Token should start with 'pk_' or 'pk.'. Length:",
      MAPBOX_TOKEN.length
    );
    return [];
  }

  try {
    // Restrict to neighborhood,locality to avoid broad city/province results that crowd out actual neighbourhoods.
    // Mapbox has no "find neighbourhood for this building" endpoint — exact condo/building identification
    // is intentionally left to the manual "Building/Condo Name" field rather than attempted via geocoding.
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&bbox=100.32,13.49,100.94,13.96&types=neighborhood,locality&proximity=100.55,13.7&country=TH`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Mapbox API error [${response.status}]:`,
        response.statusText,
        errorText
      );
      return [];
    }

    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error("Failed to fetch location suggestions:", error);
    return [];
  }
}

/**
 * Fetch filtered properties list for client-side instant filtering
 * Called from properties-client.tsx via useTransition for instant table updates
 */
export async function getPropertiesListAction(
  profileId: string,
  filters?: {
    status?: PropertyStatus;
    propertyType?: PropertyType;
    search?: string;
  }
) {
  return getPropertiesList(profileId, filters);
}

/**
 * Submit basic property details (Step 1)
 * Creates a new property with status "pending" or updates existing
 * Sets next_action to "amenities"
 */
export async function submitBasicDetailsAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  const formDataObj = Object.fromEntries(formData);
  const validationResult = basicInfoSchema.safeParse(formDataObj);
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
    let existingProperty: Property | undefined;
    if (propertyId) {
      existingProperty = (await getProperty(propertyId)) ?? undefined;
    }

    // Parse locationContext JSON if present
    let locationContext: LocationContext = {};
    if (validationResult.data.locationContext) {
      try {
        locationContext = JSON.parse(
          validationResult.data.locationContext
        ) as LocationContext;
      } catch {
        // Ignore JSON parse errors, use empty object
      }
    }

    // Thread full location context into saveBasicInfo
    const dataToSave: BasicDetailsData & { locationContext: LocationContext } =
      {
        propertyType: validationResult.data.propertyType,
        title: validationResult.data.title,
        location: validationResult.data.location,
        latitude: validationResult.data.latitude,
        longitude: validationResult.data.longitude,
        monthlyRent: validationResult.data.monthlyRent,
        bedrooms: validationResult.data.bedrooms,
        bathrooms: validationResult.data.bathrooms,
        description: validationResult.data.description,
        buildingName: validationResult.data.buildingName,
        locationContext,
      };

    const property = await saveBasicInfo(
      dataToSave,
      session.profileId,
      propertyId || undefined,
      existingProperty
    );

    // If creating new property, redirect to edit page
    if (!propertyId) {
      redirect(`/properties/${property.id}/edit`);
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
 * Submit images (Step 3)
 * Uploads new images, saves paths to property, cleans up removed images from storage
 * Sets next_action to "review"
 */
export async function submitImagesAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  const propertyId = formData.get("propertyId") as string | null;
  if (!propertyId) {
    return { errorMessage: "Property ID is required" };
  }

  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      return {
        errorMessage: "Profile not found. Please log in again.",
      };
    }

    // Role check
    if (session.role !== "agent" && session.role !== "owner") {
      return {
        errorMessage: "Only agents and owners can upload property images",
      };
    }

    // Ownership check
    const property = await getProperty(propertyId);
    if (!property) {
      return { errorMessage: "Property not found" };
    }
    if (property.profileId !== session.profileId) {
      return {
        errorMessage: "You do not have permission to edit this property",
      };
    }

    // Parse inputs
    const keepImagePathsJson = formData.get("keepImagePaths") as string | null;
    const keepImagePaths = keepImagePathsJson
      ? JSON.parse(keepImagePathsJson)
      : [];
    const newFiles = formData.getAll("images") as File[];

    // Validate count
    if (keepImagePaths.length + newFiles.length > 10) {
      return {
        errorMessage: "Maximum 10 images allowed",
      };
    }

    // Step 1: Upload new files to storage
    const newPaths: string[] = [];
    for (const file of newFiles) {
      try {
        const path = await uploadPropertyImage(
          session.profileId,
          propertyId,
          file
        );
        newPaths.push(path);
      } catch (err) {
        return {
          errorMessage: `Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`,
        };
      }
    }

    // Step 2: Compute final list and persist to DB (source of truth)
    const finalPaths = [...keepImagePaths, ...newPaths];
    await saveImages({ images: finalPaths }, propertyId);

    // Step 3: Compute removed paths and delete from storage
    const currentPaths = property.images || [];
    const removedPaths = currentPaths.filter(
      (p) => !keepImagePaths.includes(p)
    );

    if (removedPaths.length > 0) {
      try {
        await deleteImagePaths(removedPaths);
      } catch (err) {
        // Log but don't fail the whole action if storage cleanup fails
        console.error("Failed to delete orphaned images:", err);
      }
    }

    return {
      success: true,
      errorMessage: undefined,
    };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage: "Failed to save images. Please try again.",
    };
  }
}

/**
 * Submit review & confirm (Step 4)
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
