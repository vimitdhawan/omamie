import { AppError } from "@/lib/errors";
import type {
  ViewingRequest,
  ViewingRequestWithProperty,
  ViewingRequestFilter,
  ViewingRequestCounts,
  UpcomingViewing,
  ViewingRequestStatus,
  CreateViewingRequestInput,
  UpdateViewingRequestStatusInput,
} from "./types";
import * as repository from "./repository";

/**
 * Viewing Request Service
 *
 * Business logic layer for viewing requests.
 * Enforces permissions, validations, and status transition rules.
 */

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<ViewingRequestStatus, ViewingRequestStatus[]> =
  {
    pending: ["accepted", "declined", "cancelled"],
    accepted: ["completed", "cancelled"],
    declined: [],
    cancelled: [],
    completed: [],
  };

/**
 * Check if a status transition is valid
 */
function isValidTransition(
  currentStatus: ViewingRequestStatus,
  newStatus: ViewingRequestStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Get all viewing requests for a profile with optional filtering
 */
export async function getViewingRequests(
  profileId: string,
  filter?: ViewingRequestFilter
): Promise<ViewingRequestWithProperty[]> {
  try {
    return await repository.getViewingRequestsByProfileId(profileId, filter);
  } catch (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch viewing requests",
      500,
      { cause: error }
    );
  }
}

/**
 * Get a single viewing request by ID
 */
export async function getViewingRequest(
  requestId: string,
  profileId: string
): Promise<ViewingRequestWithProperty> {
  try {
    const request = await repository.getViewingRequestById(
      requestId,
      profileId
    );

    if (!request) {
      throw new AppError(
        "NOT_FOUND",
        "Viewing request not found or access denied",
        404
      );
    }

    return request;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch viewing request",
      500,
      { cause: error }
    );
  }
}

/**
 * Get viewing request counts by status
 */
export async function getRequestCounts(
  profileId: string
): Promise<ViewingRequestCounts> {
  try {
    return await repository.getViewingRequestCounts(profileId);
  } catch (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch viewing request counts",
      500,
      { cause: error }
    );
  }
}

/**
 * Get count of pending viewing requests
 */
export async function getPendingCount(profileId: string): Promise<number> {
  try {
    return await repository.getPendingRequestsCount(profileId);
  } catch (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch pending requests count",
      500,
      { cause: error }
    );
  }
}

/**
 * Get upcoming viewings (accepted requests with future dates)
 */
export async function getUpcomingViewings(
  profileId: string,
  limit?: number
): Promise<UpcomingViewing[]> {
  try {
    return await repository.getUpcomingViewings(profileId, limit);
  } catch (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch upcoming viewings",
      500,
      { cause: error }
    );
  }
}

/**
 * Update viewing request status with validation
 */
export async function updateRequestStatus(
  input: UpdateViewingRequestStatusInput,
  profileId: string
): Promise<void> {
  try {
    // First, verify the request exists and belongs to this profile
    const request = await repository.getViewingRequestById(
      input.requestId,
      profileId
    );

    if (!request) {
      throw new AppError(
        "NOT_FOUND",
        "Viewing request not found or access denied",
        404
      );
    }

    // Validate status transition
    if (!isValidTransition(request.status, input.status)) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Invalid status transition from ${request.status} to ${input.status}`,
        400
      );
    }

    // Update the status
    await repository.updateViewingRequestStatus(input.requestId, input.status);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to update viewing request status",
      500,
      { cause: error }
    );
  }
}

/**
 * Create a new viewing request
 * Note: This is typically called by tenants, but agents/owners might create on behalf of someone
 */
export async function createViewingRequest(
  input: CreateViewingRequestInput
): Promise<ViewingRequest> {
  try {
    // Additional business validations can go here
    // For example: check if property exists, check availability, etc.

    return await repository.createViewingRequest(input);
  } catch (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to create viewing request",
      500,
      { cause: error }
    );
  }
}
