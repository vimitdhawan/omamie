import {
  getActiveLeaseByTenantId,
  getLeaseDocuments,
  getLeaseDocumentSignedUrl,
} from "./repository";
import type { LeaseWithProperty, LeaseDocumentWithUrl } from "./types";

/** Returns null rather than throwing when the tenant has no active lease. */
export async function getTenantActiveLease(
  tenantId: string
): Promise<LeaseWithProperty | null> {
  return getActiveLeaseByTenantId(tenantId);
}

/**
 * Documents for a lease, each with a short-lived signed download URL. A document whose URL
 * could not be minted still appears (with `downloadUrl: null`) rather than being dropped, so
 * the UI can show it as temporarily unavailable instead of silently disappearing.
 */
export async function listLeaseDocumentsWithUrls(
  leaseId: string
): Promise<LeaseDocumentWithUrl[]> {
  const documents = await getLeaseDocuments(leaseId);

  return Promise.all(
    documents.map(async (document) => ({
      ...document,
      downloadUrl: await getLeaseDocumentSignedUrl(document.storagePath),
    }))
  );
}
