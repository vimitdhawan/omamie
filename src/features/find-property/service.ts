"use server";

import { getAuthSession } from "@/lib/auth-session";
import { createFindPropertyRequest } from "./repository";
import type { FindPropertyFormData } from "./schema";

export async function submitFindPropertyRequest(
  formData: FindPropertyFormData
) {
  const session = await getAuthSession();

  const input = {
    profileId: session!.profileId,
    propertyType: formData.propertyType,
    preferredLocation: formData.preferredLocation,
    monthlyBudget: Number(formData.monthlyBudget),
    moveInDate: formData.moveInDate,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    minSizeSqm: formData.minSizeSqm ? Number(formData.minSizeSqm) : null,
    furnishing: formData.furnishing,
  };

  const request = await createFindPropertyRequest(input);
  return request;
}
