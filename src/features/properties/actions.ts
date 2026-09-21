"use server";

import { revalidatePath } from "next/cache";
import { parsePropertyFormData, type PropertyActionState } from "./schema";
import {
  savePropertyListing,
  assertCanEditProperty,
  listProperties,
  listPublishedProperties,
  listPropertiesByIds,
  deleteProperty,
  getProperty,
} from "./service";
import { PropertyValidationError } from "./errors";
import { getAuthSession } from "@/lib/auth-session";
import { isAppError } from "@/lib/errors";
import type { PropertyStatus, PropertyType, Property } from "./types";
import type { LocationSuggestion } from "./components/property-form/location-autocomplete";

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
export async function getPropertiesListAction(filters?: {
  status?: PropertyStatus;
  propertyType?: PropertyType;
  search?: string;
}): Promise<Property[]> {
  // The profile id comes from the session, never from the caller: as a parameter it let any
  // authenticated user read another owner's listings.
  const session = await getAuthSession();
  if (!session?.profileId) {
    return [];
  }

  try {
    return await listProperties(session.profileId, filters);
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

/**
 * Fetch active listings across every owner for the tenant explore grid.
 * Called from explore-client.tsx via useTransition for instant filtering.
 */
export async function getPublishedPropertiesAction(filters?: {
  propertyType?: PropertyType;
  location?: string;
  minBedrooms?: number;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Property[]> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    return [];
  }

  try {
    return await listPublishedProperties(filters);
  } catch (error) {
    console.error("Failed to fetch published properties:", error);
    return [];
  }
}

/** Fetch properties by id (any order) for the tenant "Saved" grid. */
export async function getPropertiesByIdsAction(
  ids: string[]
): Promise<Property[]> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    return [];
  }

  if (ids.length === 0) return [];

  try {
    return await listPropertiesByIds(ids);
  } catch (error) {
    console.error("Failed to fetch properties by ids:", error);
    return [];
  }
}

/** Fetch a single active listing for the tenant property detail page. */
export async function getPublishedPropertyAction(
  propertyId: string
): Promise<Property | null> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    return null;
  }

  const property = await getProperty(propertyId);
  if (!property || property.status !== "active") {
    return null;
  }

  return property;
}

/**
 * Save the whole listing from the single property form.
 *
 * `intent` selects the validation rules: "draft" checks shape only so partial work always
 * persists, "publish" additionally requires everything a live listing needs.
 */
export async function savePropertyAction(
  _prev: PropertyActionState | null,
  formData: FormData
): Promise<PropertyActionState> {
  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      return { errorMessage: "Profile not found. Please log in again." };
    }

    if (session.role !== "owner") {
      return {
        errorMessage: "Only owners can manage property listings",
      };
    }

    const { payload, files } = parsePropertyFormData(formData);

    const propertyId =
      typeof payload.propertyId === "string" ? payload.propertyId : null;
    const existing = propertyId
      ? await assertCanEditProperty(propertyId, session.profileId)
      : null;

    const result = await savePropertyListing(
      payload,
      files,
      session.profileId,
      existing
    );

    revalidatePath("/properties");
    revalidatePath(`/properties/${result.propertyId}`);

    // A newly created listing is not redirected to here: the client swaps the URL to the
    // edit route itself, so the form stays mounted and any image warnings below survive.
    return {
      success: true,
      propertyId: result.propertyId,
      status: result.status,
      created: !existing,
      imageWarnings: result.imageWarnings.length
        ? result.imageWarnings
        : undefined,
    };
  } catch (error) {
    if (error instanceof PropertyValidationError) {
      return { errors: error.fieldErrors };
    }
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to save property:", error);
    return { errorMessage: "Failed to save property. Please try again." };
  }
}

export async function deletePropertyAction(
  propertyId: string
): Promise<PropertyActionState> {
  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      return { errorMessage: "Profile not found. Please log in again." };
    }

    await assertCanEditProperty(propertyId, session.profileId);
    await deleteProperty(propertyId, session.profileId);

    revalidatePath("/properties");
    return { success: true };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to delete property:", error);
    return { errorMessage: "Failed to delete property. Please try again." };
  }
}
