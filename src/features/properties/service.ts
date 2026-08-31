import type { BasicDetailsData, AmenitiesData } from "./schema";
import type {
  Property,
  PropertySearchFilters,
  PropertyWithMeta,
} from "./types";
import {
  createProperty,
  getPropertyById,
  updateProperty,
  completePropertySubmission,
  getPendingListing as repoPendingListing,
  mapBasicDetailsToInsert,
  mapAmenitiesDataToUpdate,
  searchActiveProperties,
  getActivePropertyById,
} from "./repository";
import { getAuthSession } from "@/lib/auth-session";

/**
 * Service layer for properties
 * Contains business logic and orchestration
 * Works exclusively with domain models (camelCase)
 */

/**
 * Save basic property details
 * Creates a new property in "pending" status or updates existing property
 */
export async function saveBasicInfo(
  data: BasicDetailsData,
  profileId: string,
  propertyId?: string
): Promise<Property> {
  if (propertyId) {
    // Update existing property - save basic details and move to next step
    const stepData = {
      title: data.title,
      property_type: data.propertyType,
      location: data.location,
      monthly_rent: data.monthlyRent,
      description: data.description ?? null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      next_action: "amenities",
    };
    return await updateProperty(propertyId, stepData);
  }

  // Create new property with basic details
  const insertData = mapBasicDetailsToInsert(data, profileId);
  return await createProperty(insertData);
}

/**
 * Save amenities and features
 * Updates property with amenities and sets next_action to "review"
 */
export async function saveAmenities(
  data: AmenitiesData,
  propertyId: string
): Promise<Property> {
  const stepData = mapAmenitiesDataToUpdate(data, "review");
  return await updateProperty(propertyId, stepData);
}

/**
 * Publish property
 * Changes status from pending to review and sets next_action to completed
 */
export async function publishProperty(propertyId: string): Promise<Property> {
  return await completePropertySubmission(propertyId);
}

/**
 * Get a property by ID
 */
export async function getProperty(id: string): Promise<Property | null> {
  return await getPropertyById(id);
}

/**
 * Get pending (incomplete) property listing for a user
 * Returns null if user has no pending listings
 */
export async function getPendingListing(
  profileId: string
): Promise<Property | null> {
  return await repoPendingListing(profileId);
}

/**
 * Server action to fetch property - can be called from client components
 */
export async function getPropertyAction(id: string): Promise<Property | null> {
  return await getProperty(id);
}

/**
 * Search active properties with filters
 * Used by tenants to browse available properties
 */
export async function searchProperties(
  filters: PropertySearchFilters
): Promise<Property[]> {
  return await searchActiveProperties(filters);
}

/**
 * Get property detail for tenant viewing with metadata
 * Includes whether the property is saved and if there's an active viewing request
 */
export async function getPropertyDetailForTenant(
  id: string
): Promise<PropertyWithMeta | null> {
  const property = await getActivePropertyById(id);

  if (!property) {
    return null;
  }

  // Get current user session
  const session = await getAuthSession();

  if (!session?.profileId) {
    // Not logged in - return property without metadata
    return {
      ...property,
      hasRequested: false,
      isSaved: false,
    };
  }

  // TODO: Check if property is saved and if there's a viewing request
  // This will be implemented once saved-properties and viewing-requests features are complete
  const hasRequested = false; // await checkViewingRequestExists(id, session.profileId);
  const isSaved = false; // await checkPropertySaved(id, session.profileId);

  return {
    ...property,
    hasRequested,
    isSaved,
  };
}

// Backward compatibility aliases
export const submitPropertyStep1 = saveBasicInfo;
export const submitPropertyStep2 = saveAmenities;
export const submitPropertyStep3 = publishProperty;
