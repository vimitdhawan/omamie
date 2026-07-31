import { createClient } from "@/lib/supabase/server";
import type { ContactInsert, ContactResult } from "./types";

export async function createContactMessage(
  input: ContactInsert
): Promise<ContactResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      full_name: input.full_name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
    })
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: data as ContactResult["data"], error: null };
}
