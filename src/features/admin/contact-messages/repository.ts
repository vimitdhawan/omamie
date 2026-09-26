import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/types";
import type { AdminContactMessage, AdminContactMessageFilter } from "./types";

/**
 * Admin reads every submitter's contact message, and contact_messages grants access to
 * service_role only (see 20260731000000_create_contact_messages.sql), so this repository
 * uses the service-role client. Callers must go through service.ts's `requireAdmin()` first;
 * nothing here re-checks the caller's role.
 */

type ContactMessageRow =
  Database["public"]["Tables"]["contact_messages"]["Row"];

const CONTACT_MESSAGE_SELECT =
  "id, full_name, email, phone, subject, message, created_at, status, resolution_note, resolved_at";

function mapRow(row: ContactMessageRow): AdminContactMessage {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
    status: row.status as AdminContactMessage["status"],
    resolutionNote: row.resolution_note,
    resolvedAt: row.resolved_at,
  };
}

export async function listContactMessages(
  filter: AdminContactMessageFilter
): Promise<AdminContactMessage[]> {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("contact_messages")
    .select(CONTACT_MESSAGE_SELECT)
    .eq("status", filter.status)
    .order("created_at", { ascending: false });

  if (filter.from) {
    query = query.gte("created_at", `${filter.from}T00:00:00.000Z`);
  }
  if (filter.to) {
    query = query.lte("created_at", `${filter.to}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch contact messages");
  }

  return ((data as unknown as ContactMessageRow[] | null) ?? []).map(mapRow);
}

/**
 * Guarded with `.eq("status", "open")` so completion is one-way: a message that is already
 * completed cannot be re-completed or have its resolution overwritten. No rows updated means
 * the message wasn't open, which the caller surfaces as an error.
 */
export async function markContactMessageCompleted(
  id: string,
  resolutionNote: string,
  resolvedBy: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      status: "completed",
      resolution_note: resolutionNote,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq("id", id)
    .eq("status", "open")
    .select("id");

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to complete contact message");
  }

  if (!data || data.length === 0) {
    throw new AppError(
      "NOT_FOUND",
      "This message was not found or has already been completed"
    );
  }
}
