import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  Lease,
  LeaseWithProperty,
  LeaseDocument,
  LeaseStatus,
} from "./types";
import { AppError } from "@/lib/errors";

interface DatabaseLease {
  id: string;
  property_id: string;
  tenant_id: string;
  status: string;
  lease_start: string;
  lease_end: string;
  monthly_rent: number;
  security_deposit: number | null;
  payment_method: string | null;
  next_payment_due: string | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseLeaseDocument {
  id: string;
  lease_id: string;
  name: string;
  file_type: string | null;
  file_size_bytes: number | null;
  storage_path: string;
  created_at: string;
}

function mapDatabaseLease(row: DatabaseLease): Lease {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    status: row.status as LeaseStatus,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    monthlyRent: row.monthly_rent,
    securityDeposit: row.security_deposit,
    paymentMethod: row.payment_method,
    nextPaymentDue: row.next_payment_due,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDatabaseLeaseDocument(row: DatabaseLeaseDocument): LeaseDocument {
  return {
    id: row.id,
    leaseId: row.lease_id,
    name: row.name,
    fileType: row.file_type,
    fileSizeBytes: row.file_size_bytes,
    storagePath: row.storage_path,
    createdAt: row.created_at,
  };
}

type LeaseRow = DatabaseLease & {
  property: {
    id: string;
    title: string;
    location: string | null;
    property_images: Array<{
      storage_path: string;
      sort_order: number;
      status: string;
    }> | null;
  } | null;
};

function mapLeaseRowWithProperty(row: LeaseRow): LeaseWithProperty {
  const uploadedImages = (row.property?.property_images ?? [])
    .filter((image) => image.status === "uploaded")
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...mapDatabaseLease(row),
    property: {
      id: row.property?.id ?? row.property_id,
      title: row.property?.title ?? "Property",
      location: row.property?.location ?? null,
      coverImagePath: uploadedImages[0]?.storage_path ?? null,
    },
  };
}

/** A tenant's currently active lease, joined with its property for the "My Rentals" hero card. */
export async function getActiveLeaseByTenantId(
  tenantId: string
): Promise<LeaseWithProperty | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leases")
    .select(
      `
      *,
      property:properties(id, title, location, property_images(storage_path, sort_order, status))
    `
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch lease");
  }

  return data ? mapLeaseRowWithProperty(data as unknown as LeaseRow) : null;
}

export async function getLeaseDocuments(
  leaseId: string
): Promise<LeaseDocument[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lease_documents")
    .select("*")
    .eq("lease_id", leaseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch lease documents");
  }

  return (data || []).map((row) =>
    mapDatabaseLeaseDocument(row as DatabaseLeaseDocument)
  );
}

/**
 * The `lease-documents` bucket is private with service-role-only storage policies (see the
 * migration), so a signed URL must be minted with the service-role client even though the
 * caller already proved (via `getLeaseDocuments`, which is RLS-scoped) that they may see the
 * row referencing this path.
 */
export async function getLeaseDocumentSignedUrl(
  storagePath: string
): Promise<string | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.storage
    .from("lease-documents")
    .createSignedUrl(storagePath, 60 * 5);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}
