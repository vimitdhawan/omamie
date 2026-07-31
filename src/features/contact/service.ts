import { createContactMessage as repoCreateContactMessage } from "./repository";
import type { ContactInsert, ContactResult } from "./types";

function mapError(message: string): string {
  if (message.includes("violates row-level security policy")) {
    return "Unable to submit your message right now. Please try again later.";
  }
  if (message.includes("duplicate key")) {
    return "This message has already been submitted.";
  }
  return message;
}

export async function submitContactMessage(
  input: ContactInsert
): Promise<{ success: true } | { success: false; errorMessage: string }> {
  const { data, error } = await repoCreateContactMessage(input);

  if (error) {
    return { success: false, errorMessage: mapError(error.message) };
  }

  if (!data) {
    return {
      success: false,
      errorMessage: "Something went wrong. Please try again.",
    };
  }

  return { success: true };
}

export type SubmitContactMessageResult = Awaited<
  ReturnType<typeof submitContactMessage>
>;

export type { ContactResult };
