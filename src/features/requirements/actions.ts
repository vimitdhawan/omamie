"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";
import * as service from "./service";
import { requirementsFormSchema, type RequirementsActionState } from "./schema";
import { curateMatchesForTenant } from "@/features/property-matches/service";

export async function handleSaveRequirements(
  prevState: RequirementsActionState,
  formData: FormData
): Promise<RequirementsActionState> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const rawData = {
    firstName: String(formData.get("firstName") ?? ""),
    occupation: String(formData.get("occupation") ?? ""),
    employer: String(formData.get("employer") ?? ""),
    reasonForMoving: String(formData.get("reasonForMoving") ?? ""),
    intendedDuration: formData.get("intendedDuration"),
    numberOfOccupants: formData.get("numberOfOccupants"),
    hasPets: formData.get("hasPets") === "on",
    isSmoker: formData.get("isSmoker") === "on",
    bio: String(formData.get("bio") ?? ""),
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

  const validationResult = requirementsFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const { requirements } = await service.saveRequirements(
      session.profileId,
      validationResult.data
    );
    // Best-effort — a scoring failure should never block saving the request itself.
    await curateMatchesForTenant(session.profileId, requirements).catch(
      (error) => {
        console.error(
          "Failed to curate matches after saving requirements:",
          error
        );
      }
    );
    revalidatePath("/find-property");
    revalidatePath("/matches");
    return { success: true };
  } catch {
    return { errorMessage: "Failed to save your details. Please try again." };
  }
}

export async function getOwnRequirementsAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  try {
    return await service.getOwnRequirements(session.profileId);
  } catch (error) {
    console.error("Failed to fetch tenant requirements:", error);
    return { profile: null, requirements: null };
  }
}

export async function getMatchTenantDetailAction(matchId: string) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  return service.getTenantDetailForMatch(matchId, session.profileId);
}
