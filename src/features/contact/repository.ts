import { createClient } from "@/lib/supabase/server";
import type { ContactInput } from "./types";
import type { Database } from "@/lib/supabase/types";
import { AppError } from "@/lib/types/error";

type ContactInsert = Database["public"]["Tables"]["contact_messages"]["Insert"];

export async function create(input: ContactInput) {
  const supabase = await createClient();
  const contactInsert = mapContactInputToInsert(input);

  const { error } = await supabase
    .from("contact_messages")
    .insert(contactInsert);
  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to create contact message", {
      cause: error,
    });
  }
}

// src/features/contact/repository.ts
function mapContactInputToInsert(input: ContactInput): ContactInsert {
  return {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    subject: input.subject,
    message: input.message,
  };
}
