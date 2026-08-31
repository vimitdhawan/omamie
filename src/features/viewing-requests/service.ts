import type {
  ViewingRequest,
  ViewingRequestWithProperty,
  CreateViewingRequestInput,
} from "./types";
import {
  createViewingRequest as repoCreateViewingRequest,
  getViewingRequestsByTenant,
  updateViewingRequestStatus,
  checkViewingRequestExists,
} from "./repository";
import { getAuthSession } from "@/lib/auth-session";
import { AppError } from "@/lib/errors";

/**
 * Service layer for viewing requests
 * Contains business logic and orchestration
 */

/**
 * Create a viewing request for a property
 */
export async function createViewingRequest(
  input: CreateViewingRequestInput
): Promise<ViewingRequest> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError(
      "UNAUTHORIZED",
      "You must be logged in to request a viewing"
    );
  }

  if (session.role !== "tenant") {
    throw new AppError(
      "FORBIDDEN",
      "Only tenants can request property viewings"
    );
  }

  return await repoCreateViewingRequest(
    session.profileId,
    input.propertyId,
    input.message
  );
}

/**
 * Get viewing requests for the current tenant
 */
export async function getMyViewingRequests(): Promise<
  ViewingRequestWithProperty[]
> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError("UNAUTHORIZED", "You must be logged in");
  }

  return await getViewingRequestsByTenant(session.profileId);
}

/**
 * Cancel a viewing request
 */
export async function cancelViewingRequest(
  requestId: string
): Promise<ViewingRequest> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError("UNAUTHORIZED", "You must be logged in");
  }

  return await updateViewingRequestStatus(requestId, "cancelled");
}

/**
 * Confirm a viewing request (tenant accepts agent's proposed time)
 */
export async function confirmViewingRequest(
  requestId: string
): Promise<ViewingRequest> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    throw new AppError("UNAUTHORIZED", "You must be logged in");
  }

  return await updateViewingRequestStatus(requestId, "confirmed");
}

/**
 * Check if viewing request exists for a property
 */
export async function checkViewingRequest(
  propertyId: string
): Promise<boolean> {
  const session = await getAuthSession();

  if (!session?.profileId) {
    return false;
  }

  return await checkViewingRequestExists(propertyId, session.profileId);
}
