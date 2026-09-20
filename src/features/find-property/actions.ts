"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";
import { submitFindPropertyRequest } from "./service";
import { getFindRequestsByProfileId } from "./repository";
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
    preferredNeighborhoods: String(formData.get("preferredNeighborhoods") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    petFriendly: formData.get("petFriendly") === "on",
    parkingNeeded: formData.get("parkingNeeded") === "on",
    amenitiesWishlist: formData.getAll("amenitiesWishlist").map(String),
    additionalNotes: String(formData.get("additionalNotes") ?? ""),
    preferredLeaseLength: String(formData.get("preferredLeaseLength") ?? ""),
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
    revalidatePath("/matches");
    return { success: true };
  } catch {
    return { errorMessage: "Failed to submit request. Please try again." };
  }
}

export async function getFindRequestsAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  try {
    return await getFindRequestsByProfileId(session.profileId);
  } catch (error) {
    console.error("Failed to fetch find requests:", error);
    return [];
  }
}
