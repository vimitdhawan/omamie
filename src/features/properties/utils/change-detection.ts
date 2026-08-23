import type { BasicDetailsData, AmenitiesData } from "../schema";
import type { Property } from "../types";

/**
 * Check if basic details form values have changed from current property state
 */
export function hasBasicDetailsChanged(
  formValues: BasicDetailsData,
  property: Property
): boolean {
  return (
    formValues.propertyType !== property.propertyType ||
    formValues.title !== property.title ||
    formValues.location !== property.location ||
    formValues.monthlyRent !== property.monthlyRent ||
    formValues.bedrooms !== property.bedrooms ||
    formValues.bathrooms !== property.bathrooms ||
    (formValues.description || null) !== property.description
  );
}

/**
 * Check if amenities form values have changed from current property state
 */
export function hasAmenitiesChanged(
  formValues: AmenitiesData,
  property: Property
): boolean {
  const amenitiesChanged =
    formValues.amenities.length !== property.amenities.length ||
    !formValues.amenities.every((a) => property.amenities.includes(a));

  return (
    formValues.furnishedStatus !== property.furnishedStatus || amenitiesChanged
  );
}
