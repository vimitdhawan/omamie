import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ContactInput } from "./types";
import type { Database } from "@/lib/supabase/types";
import { AppError } from "@/lib/types/error";

type ContactInsert = Database["public"]["Tables"]["contact_messages"]["Insert"];

export async function create(input: ContactInput) {
  const supabase = createServiceRoleClient();
  const contactInsert = mapContactInputToInsert(input);

  const { error } = await supabase
    .from("contact_messages")
    .insert(contactInsert);

  if (error) {
    const errorMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      errorMessage || "Failed to create contact message",
      { cause: error }
    );
  }
}

function mapDatabaseErrorToUserMessage(
  error: { code?: string; message?: string } | null
): string | null {
  if (!error) return null;

  const errorCode = error.code;
  const message = error.message || "";

  switch (errorCode) {
    case "23505": // Unique constraint violation
      return "This email has already contacted us recently. Please try again later.";
    case "42P01": // Table doesn't exist
      return "Service temporarily unavailable. Please try again later.";
    case "HV000": // FDW error (foreign data wrapper)
      return "Service temporarily unavailable. Please try again later.";
    default:
      if (message.includes("permission")) {
        return "You don't have permission to submit this form.";
      }
      return null; // Return null to use generic message
  }
}

function mapContactInputToInsert(input: ContactInput): ContactInsert {
  return {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    subject: input.subject,
    message: input.message,
  };
}

/**
 * Get all contact messages (admin only)
 * Returns all contact messages ordered by creation date (newest first)
 */
export async function getAll() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch contact messages", {
      cause: error,
    });
  }

  return (
    data?.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      createdAt: row.created_at,
    })) || []
  );
}
