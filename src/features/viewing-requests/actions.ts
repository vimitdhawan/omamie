"use server";

import { revalidatePath } from "next/cache";
import {
  createViewingRequest,
  getMyViewingRequests,
  cancelViewingRequest,
  confirmViewingRequest,
} from "./service";
import { createViewingRequestSchema } from "./schema";
import type { ActionResult } from "@/types/actions";
import type { ViewingRequest, ViewingRequestWithProperty } from "./types";
import { isAppError } from "@/lib/errors";

/**
 * Create a viewing request for a property
 */
export async function createViewingRequestAction(
  input: unknown
): Promise<ActionResult<ViewingRequest>> {
  try {
    const validationResult = createViewingRequestSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error:
          validationResult.error.issues?.[0]?.message || "Invalid request data",
      };
    }

    const viewingRequest = await createViewingRequest(validationResult.data);

    // Revalidate relevant paths
    revalidatePath("/browse-properties");
    revalidatePath("/my-requests");
    revalidatePath(`/browse-properties/${validationResult.data.propertyId}`);

    return {
      success: true,
      data: viewingRequest,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to create viewing request. Please try again.",
    };
  }
}

/**
 * Get all viewing requests for current tenant
 */
export async function getMyViewingRequestsAction(): Promise<
  ActionResult<ViewingRequestWithProperty[]>
> {
  try {
    const requests = await getMyViewingRequests();

    return {
      success: true,
      data: requests,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to load viewing requests. Please try again.",
    };
  }
}

/**
 * Cancel a viewing request
 */
export async function cancelViewingRequestAction(
  requestId: string
): Promise<ActionResult<ViewingRequest>> {
  try {
    const request = await cancelViewingRequest(requestId);

    revalidatePath("/my-requests");

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to cancel viewing request. Please try again.",
    };
  }
}

/**
 * Confirm a viewing request (accept agent's proposed time)
 */
export async function confirmViewingRequestAction(
  requestId: string
): Promise<ActionResult<ViewingRequest>> {
  try {
    const request = await confirmViewingRequest(requestId);

    revalidatePath("/my-requests");
    revalidatePath("/matches");

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to confirm viewing request. Please try again.",
    };
  }
}
