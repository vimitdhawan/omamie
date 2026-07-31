"use server";

import { redirect } from "next/navigation";
import { listPropertySchema, extractFirstError, type Amenity } from "./schema";
import { createPropertyListing } from "./service";
import type { PropertyActionResult } from "./types";

/**
 * Server action to handle property listing form submission
 * Validates all 3 steps and creates property in database
 */
export async function listPropertyAction(
  _prev: PropertyActionResult | null,
  formData: FormData
): Promise<PropertyActionResult> {
  // Extract and parse form data
  const rawData = {
    // Step 1: Property Details
    propertyType: formData.get("propertyType") as string,
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    monthlyRent: Number(formData.get("monthlyRent")),
    description: formData.get("description") as string | undefined,

    // Step 2: Amenities
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    furnishedStatus: formData.get("furnishedStatus") as string,
    amenities: formData.getAll("amenities") as Amenity[],

    // Step 3: Review
    acceptTerms: formData.get("acceptTerms") === "true",
    confirmAccuracy: formData.get("confirmAccuracy") === "true",
  };

  // Validate with Zod schema
  const parsed = listPropertySchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: extractFirstError(parsed.error.issues),
    };
  }

  // Create property listing
  const result = await createPropertyListing(parsed.data);

  if (result.error || !result.property) {
    return {
      success: false,
      error: result.error ?? "Failed to create property listing",
    };
  }

  // Redirect to success page with property ID
  redirect(`/list-property/success?id=${result.property.id}`);
}
