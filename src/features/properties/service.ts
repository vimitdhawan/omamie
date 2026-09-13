import type { BasicDetailsData, AmenitiesData, ImagesData } from "./schema";
import type { Property, Location, LocationContext } from "./types";
import {
  createProperty,
  getPropertyById,
  updateProperty,
  completePropertySubmission,
  getPendingListing as repoPendingListing,
  mapBasicDetailsToInsert,
  mapAmenitiesDataToUpdate,
  mapImagesDataToUpdate,
  createLocation,
  updateLocation,
  PropertyUpdateTable,
} from "./repository";

/**
 * Service layer for properties
 * Contains business logic and orchestration
 * Works exclusively with domain models (camelCase)
 */

/**
 * Save basic property details
 * Creates a new property in "pending" status or updates existing property
 * Handles location geocoding via Mapbox
 */
export async function saveBasicInfo(
  data: BasicDetailsData & { locationContext?: LocationContext },
  profileId: string,
  propertyId?: string,
  existingProperty?: Property
): Promise<Property> {
  // Build location data from form with full context
  const locationData: Location | undefined =
    data.latitude && data.longitude
      ? {
          addressLine1: data.location,
          addressLine2: data.buildingName || undefined,
          city: data.locationContext?.city || undefined,
          district: data.locationContext?.district || undefined,
          state: data.locationContext?.state || undefined,
          postalCode: data.locationContext?.postalCode || undefined,
          country: data.locationContext?.country || undefined,
          countryCode: data.locationContext?.countryCode || undefined,
          provider: data.locationContext?.provider || undefined,
          providerPlaceId: data.locationContext?.providerPlaceId || undefined,
          latitude: data.latitude,
          longitude: data.longitude,
        }
      : undefined;

  if (propertyId && existingProperty) {
    // Update existing property - save basic details and move to next step
    let locationId = existingProperty.locationId;

    // Create or update location if coordinates provided
    if (locationData) {
      if (locationId) {
        // Update existing location
        await updateLocation(locationId, locationData);
      } else {
        // Create new location
        const newLocation = await createLocation(locationData);
        locationId = newLocation.id;
      }
    }

    const stepData: Partial<PropertyUpdateTable> = {
      title: data.title,
      property_type: data.propertyType,
      location: data.location,
      monthly_rent: data.monthlyRent,
      description: data.description ?? null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      next_action: "amenities",
    };

    if (locationId) {
      stepData.location_id = locationId;
    }

    return await updateProperty(propertyId, stepData);
  }

  // Create new location first if coordinates provided
  let locationId: string | undefined;
  if (locationData) {
    const newLocation = await createLocation(locationData);
    locationId = newLocation.id;
  }

  // Create new property with basic details
  const insertData = {
    ...mapBasicDetailsToInsert(data, profileId),
    location_id: locationId,
  };
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
 * Save images
 * Updates property with images and sets next_action to "review"
 */
export async function saveImages(
  data: ImagesData,
  propertyId: string
): Promise<Property> {
  const stepData = mapImagesDataToUpdate(data, "review");
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
