"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import { isAppError } from "@/lib/errors";
import {
  updateViewingRequestStatusSchema,
  type UpdateViewingRequestStatusInput,
} from "./schema";
import * as service from "./service";
import * as notifications from "./notifications";

/**
 * Viewing Request Server Actions
 *
 * Public API for UI components to interact with viewing requests.
 * All actions enforce authentication and authorization.
 */

export type ActionState = {
  success?: boolean;
  errorMessage?: string;
  errors?: Record<string, string[]>;
};

/**
 * Update viewing request status
 */
export async function updateViewingRequestStatusAction(
  input: UpdateViewingRequestStatusInput
): Promise<ActionState> {
  // Validate input
  const validationResult = updateViewingRequestStatusSchema.safeParse(input);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.profileId) {
      return {
        errorMessage: "Profile not found. Please log in again.",
      };
    }

    // Only agents and owners can update viewing request status
    if (session.role !== "agent" && session.role !== "owner") {
      return {
        errorMessage: "Only agents and owners can update viewing requests",
      };
    }

    // Get the request to check ownership and for notifications
    const request = await service.getViewingRequest(
      validationResult.data.requestId,
      session.profileId
    );

    // Update the status
    await service.updateRequestStatus(validationResult.data, session.profileId);

    // Send notifications based on status
    // TODO: Get owner email from profile
    const ownerEmail = session.email || "owner@example.com";

    switch (validationResult.data.status) {
      case "accepted":
        await notifications.sendRequestAcceptedNotification(request);
        break;
      case "declined":
        await notifications.sendRequestDeclinedNotification(request);
        break;
      case "cancelled":
        await notifications.sendRequestCancelledNotification(
          request,
          ownerEmail
        );
        break;
      // No notification for completed status
    }

    // Revalidate relevant paths
    revalidatePath("/viewing-requests");
    revalidatePath(`/viewing-requests/${validationResult.data.requestId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage:
        "Failed to update viewing request status. Please try again.",
    };
  }
}

/**
 * Get viewing requests with filters
 * Note: This is used by the UI to fetch data server-side
 */
export async function getViewingRequestsAction(filter?: {
  status?: string;
  search?: string;
  propertyId?: string;
}) {
  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      throw new Error("Unauthorized");
    }

    if (session.role !== "agent" && session.role !== "owner") {
      throw new Error("Only agents and owners can view viewing requests");
    }

    return await service.getViewingRequests(session.profileId, filter);
  } catch (error) {
    throw error;
  }
}

/**
 * Get viewing request counts
 */
export async function getViewingRequestCountsAction() {
  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      throw new Error("Unauthorized");
    }

    if (session.role !== "agent" && session.role !== "owner") {
      throw new Error("Only agents and owners can view viewing requests");
    }

    return await service.getRequestCounts(session.profileId);
  } catch (error) {
    throw error;
  }
}

/**
 * Get pending requests count (for badge)
 */
export async function getPendingRequestsCountAction() {
  try {
    const session = await getAuthSession();
    if (!session?.profileId) {
      return 0;
    }

    if (session.role !== "agent" && session.role !== "owner") {
      return 0;
    }

    return await service.getPendingCount(session.profileId);
  } catch {
    return 0;
  }
}
