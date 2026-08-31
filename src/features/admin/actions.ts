"use server";

import { revalidatePath } from "next/cache";
import * as service from "./service";
import { getAuthSession } from "@/lib/auth-session";
import { replyEmailSchema, propertyRejectionSchema } from "./schema";
import { AppError } from "@/lib/types/error";
import type { ReplyEmailActionState, PropertyActionState } from "./schema";

/**
 * Server action to approve a property
 * Only accessible by admin users
 */
export async function approvePropertyAction(
  propertyId: string
): Promise<PropertyActionState> {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "admin") {
      return {
        errorMessage: "Unauthorized: Admin access required",
      };
    }

    await service.approveProperty(propertyId, session.profileId);

    // Revalidate admin properties page
    revalidatePath("/admin/properties");

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        errorMessage: error.message,
      };
    }

    return {
      errorMessage: "Failed to approve property. Please try again.",
    };
  }
}

/**
 * Server action to reject a property with optional reason
 * Only accessible by admin users
 */
export async function rejectPropertyAction(
  propertyId: string,
  reason?: string
): Promise<PropertyActionState> {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "admin") {
      return {
        errorMessage: "Unauthorized: Admin access required",
      };
    }

    // Validate reason if provided
    if (reason) {
      const validated = propertyRejectionSchema.safeParse({
        propertyId,
        reason,
      });

      if (!validated.success) {
        return {
          errorMessage: validated.error.issues[0]?.message || "Invalid reason",
        };
      }
    }

    await service.rejectProperty(propertyId, session.profileId, reason);

    // Revalidate admin properties page
    revalidatePath("/admin/properties");

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        errorMessage: error.message,
      };
    }

    return {
      errorMessage: "Failed to reject property. Please try again.",
    };
  }
}

/**
 * Server action to send a reply email to a contact message
 * Only accessible by admin users
 */
export async function sendReplyAction(
  prevState: ReplyEmailActionState | null,
  formData: FormData
): Promise<ReplyEmailActionState> {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "admin") {
      return {
        errorMessage: "Unauthorized: Admin access required",
      };
    }

    // Validate form data
    const validated = replyEmailSchema.safeParse({
      to: formData.get("to"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      originalMessageId: formData.get("originalMessageId"),
    });

    if (!validated.success) {
      return {
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // Send the email
    await service.sendContactReply(validated.data);

    // Revalidate admin messages page
    revalidatePath("/admin/messages");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorMessage: error.message,
      };
    }

    return {
      errorMessage: "Failed to send email. Please try again.",
    };
  }
}
