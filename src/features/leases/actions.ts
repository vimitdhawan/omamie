"use server";

import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as service from "./service";
import { leaseIdSchema } from "./schema";
import type { LeaseWithProperty, LeaseDocumentWithUrl } from "./types";

/** The tenant's active lease, or null if they don't have one. Never throws for that case. */
export async function getTenantLeaseAction(): Promise<LeaseWithProperty | null> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  return service.getTenantActiveLease(session.profileId);
}

export async function getLeaseDocumentsAction(
  leaseId: string
): Promise<LeaseDocumentWithUrl[]> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const validLeaseId = leaseIdSchema.parse(leaseId);
  return service.listLeaseDocumentsWithUrls(validLeaseId);
}
