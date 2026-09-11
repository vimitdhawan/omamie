export async function sendNewInterestNotification(
  propertyOwnerId: string,
  propertyTitle: string,
  tenantName: string
) {
  // TODO: Implement email/notification
  console.log(
    `New interest for "${propertyTitle}" from ${tenantName} (owner: ${propertyOwnerId})`
  );
}

export async function sendMatchApprovedNotification(
  tenantId: string,
  propertyTitle: string
) {
  // TODO: Implement email/notification
  console.log(`Match approved for "${propertyTitle}" (tenant: ${tenantId})`);
}

export async function sendMatchRejectedNotification(
  tenantId: string,
  propertyTitle: string
) {
  // TODO: Implement email/notification
  console.log(`Match rejected for "${propertyTitle}" (tenant: ${tenantId})`);
}
