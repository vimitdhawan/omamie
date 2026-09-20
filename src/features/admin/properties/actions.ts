"use server";

import { revalidatePath } from "next/cache";
import { reviewDecisionSchema } from "./schema";
import { approveProperty, rejectProperty } from "./service";
import { isAppError } from "@/lib/errors";

export type ReviewActionState = {
  success?: boolean;
  errorMessage?: string;
};

export async function approvePropertyAction(
  propertyId: string
): Promise<ReviewActionState> {
  const parsed = reviewDecisionSchema.safeParse({ propertyId });
  if (!parsed.success) {
    return { errorMessage: "Invalid property" };
  }

  try {
    await approveProperty(parsed.data.propertyId);
    revalidatePath("/dashboard");
    revalidatePath("/properties");
    revalidatePath(`/properties/${parsed.data.propertyId}`);
    return { success: true };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to approve property:", error);
    return { errorMessage: "Failed to approve property. Please try again." };
  }
}

export async function rejectPropertyAction(
  propertyId: string
): Promise<ReviewActionState> {
  const parsed = reviewDecisionSchema.safeParse({ propertyId });
  if (!parsed.success) {
    return { errorMessage: "Invalid property" };
  }

  try {
    await rejectProperty(parsed.data.propertyId);
    revalidatePath("/dashboard");
    revalidatePath("/properties");
    revalidatePath(`/properties/${parsed.data.propertyId}`);
    return { success: true };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to reject property:", error);
    return { errorMessage: "Failed to reject property. Please try again." };
  }
}
