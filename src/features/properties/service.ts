import type { ListPropertyFormData } from "./schema";
import type { PropertyInsert, CreatePropertyResult } from "./types";
import { createProperty, getPropertyById } from "./repository";

/**
 * Service layer for properties
 * Contains business logic and orchestration
 */

/**
 * Create a new property listing
 * @param data - Validated form data from the listing form
 * @returns Property creation result
 */
export async function createPropertyListing(
  data: ListPropertyFormData
): Promise<CreatePropertyResult> {
  // Transform form data to database insert format
  const propertyData: PropertyInsert = {
    profile_id: "test", // Placeholder - will be actual user ID in future
    title: data.title,
    property_type: data.propertyType,
    location: data.location,
    monthly_rent: data.monthlyRent,
    description: data.description ?? null,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    furnished_status: data.furnishedStatus,
    amenities: data.amenities,
    status: "pending_review",
  };

  // Call repository to insert into database
  const result = await createProperty(propertyData);

  if (result.error) {
    return {
      property: null,
      error: "Failed to create property listing. Please try again.",
    };
  }

  return {
    property: result.property,
    error: null,
  };
}

/**
 * Get a property by ID
 * @param id - Property ID
 * @returns Property or error
 */
export async function getProperty(id: string): Promise<CreatePropertyResult> {
  const result = await getPropertyById(id);

  if (result.error) {
    return {
      property: null,
      error: "Property not found",
    };
  }

  return {
    property: result.property,
    error: null,
  };
}
