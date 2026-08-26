"use server";

import { revalidatePath } from "next/cache";
import { submitFindPropertyRequest } from "./service";
import { findPropertyFormSchema, type FindPropertyActionState } from "./schema";

export async function handleFindProperty(
  prevState: FindPropertyActionState,
  formData: FormData
): Promise<FindPropertyActionState> {
  const rawData = {
    propertyType: formData.get("propertyType"),
    preferredLocation: formData.get("preferredLocation"),
    monthlyBudget: formData.get("monthlyBudget"),
    moveInDate: formData.get("moveInDate"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    minSizeSqm: formData.get("minSizeSqm"),
    furnishing: formData.get("furnishing"),
  };

  const validationResult = findPropertyFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await submitFindPropertyRequest(validationResult.data);
    revalidatePath("/find-property");
    return { success: true };
  } catch {
    return { errorMessage: "Failed to submit request. Please try again." };
  }
}
