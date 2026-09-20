import { z } from "zod";

// Read-only phase: leases are created by owner/admin elsewhere. The only inputs a tenant
// action takes are ids to scope reads, so the schemas here are intentionally minimal.

export const leaseIdSchema = z.string().uuid("Invalid lease ID");

export const tenantIdSchema = z.string().uuid("Invalid tenant ID");
