import { requireAdmin } from "../shared/auth";
import { listContactMessages, markContactMessageCompleted } from "./repository";
import { completedRangeSchema } from "./schema";
import { AppError } from "@/lib/errors";
import type { AdminContactMessage } from "./types";

export async function getOpenContactMessages(): Promise<AdminContactMessage[]> {
  await requireAdmin();
  return await listContactMessages({ status: "open" });
}

export async function getCompletedContactMessages(
  from: string,
  to: string
): Promise<AdminContactMessage[]> {
  await requireAdmin();

  const parsed = completedRangeSchema.safeParse({ from, to });
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid date range"
    );
  }

  return await listContactMessages({
    status: "completed",
    from: parsed.data.from,
    to: parsed.data.to,
  });
}

export async function completeContactMessage(
  id: string,
  resolutionNote: string
): Promise<void> {
  const adminProfileId = await requireAdmin();
  await markContactMessageCompleted(id, resolutionNote, adminProfileId);
}
