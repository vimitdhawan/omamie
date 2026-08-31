import type { ViewingRequestWithProperty } from "./types";

/**
 * Viewing Request Email Notifications
 *
 * Placeholder functions for email notifications.
 * These will be implemented when email service is integrated.
 */

/**
 * Send email notification when a new viewing request is created
 */
export async function sendNewRequestNotification(
  request: ViewingRequestWithProperty,
  ownerEmail: string
): Promise<void> {
  // TODO: Implement email notification
  // Send to property owner/agent
  console.log("[EMAIL] New viewing request created", {
    to: ownerEmail,
    requestId: request.id,
    property: request.property.title,
    requester: request.requesterName,
    requestedDate: request.requestedDate,
    requestedTime: `${request.requestedTimeStart} - ${request.requestedTimeEnd}`,
  });
}

/**
 * Send email notification when a request is accepted
 */
export async function sendRequestAcceptedNotification(
  request: ViewingRequestWithProperty
): Promise<void> {
  // TODO: Implement email notification
  // Send to requester
  console.log("[EMAIL] Viewing request accepted", {
    to: request.requesterEmail,
    requestId: request.id,
    property: request.property.title,
    requestedDate: request.requestedDate,
    requestedTime: `${request.requestedTimeStart} - ${request.requestedTimeEnd}`,
  });
}

/**
 * Send email notification when a request is declined
 */
export async function sendRequestDeclinedNotification(
  request: ViewingRequestWithProperty
): Promise<void> {
  // TODO: Implement email notification
  // Send to requester
  console.log("[EMAIL] Viewing request declined", {
    to: request.requesterEmail,
    requestId: request.id,
    property: request.property.title,
    requestedDate: request.requestedDate,
  });
}

/**
 * Send email notification when a request is cancelled
 */
export async function sendRequestCancelledNotification(
  request: ViewingRequestWithProperty,
  ownerEmail: string
): Promise<void> {
  // TODO: Implement email notification
  // Send to both owner and requester
  console.log("[EMAIL] Viewing request cancelled", {
    toOwner: ownerEmail,
    toRequester: request.requesterEmail,
    requestId: request.id,
    property: request.property.title,
    requestedDate: request.requestedDate,
  });
}

/**
 * Send reminder email 24 hours before viewing
 */
export async function sendViewingReminderNotification(
  request: ViewingRequestWithProperty,
  ownerEmail: string
): Promise<void> {
  // TODO: Implement email notification
  // Send to both owner and requester
  console.log("[EMAIL] Viewing reminder (24h)", {
    toOwner: ownerEmail,
    toRequester: request.requesterEmail,
    requestId: request.id,
    property: request.property.title,
    requestedDate: request.requestedDate,
    requestedTime: `${request.requestedTimeStart} - ${request.requestedTimeEnd}`,
  });
}
