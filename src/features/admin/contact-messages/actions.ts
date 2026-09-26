"use server";

import { revalidatePath } from "next/cache";
import { completeContactMessageSchema } from "./schema";
import { completeContactMessage, getCompletedContactMessages } from "./service";
import { isAppError } from "@/lib/errors";
import type { AdminContactMessage } from "./types";

export type ContactMessageActionState = {
  success?: boolean;
  errorMessage?: string;
};

export async function completeContactMessageAction(
  id: string,
  resolutionNote: string
): Promise<ContactMessageActionState> {
  const parsed = completeContactMessageSchema.safeParse({
    id,
    resolutionNote,
  });
  if (!parsed.success) {
    return {
      errorMessage:
        parsed.error.issues[0]?.message ?? "Invalid resolution note",
    };
  }

  try {
    await completeContactMessage(parsed.data.id, parsed.data.resolutionNote);
    revalidatePath("/contact-messages");
    return { success: true };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to complete contact message:", error);
    return {
      errorMessage: "Failed to complete this message. Please try again.",
    };
  }
}

export type FetchCompletedContactMessagesState = {
  messages?: AdminContactMessage[];
  errorMessage?: string;
};

export async function fetchCompletedContactMessagesAction(
  from: string,
  to: string
): Promise<FetchCompletedContactMessagesState> {
  try {
    const messages = await getCompletedContactMessages(from, to);
    return { messages };
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Failed to fetch completed contact messages:", error);
    return {
      errorMessage: "Failed to load completed messages. Please try again.",
    };
  }
}
