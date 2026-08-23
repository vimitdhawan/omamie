import type { BasicDetailsData, AmenitiesData } from "./schema";
import type { Property } from "./types";
import {
  createProperty,
  getPropertyById,
  updateProperty,
  completePropertySubmission,
  getPendingListing as repoPendingListing,
  mapBasicDetailsToInsert,
  mapAmenitiesDataToUpdate,
} from "./repository";

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

// Backward compatibility aliases
export const submitPropertyStep1 = saveBasicInfo;
export const submitPropertyStep2 = saveAmenities;
export const submitPropertyStep3 = publishProperty;
