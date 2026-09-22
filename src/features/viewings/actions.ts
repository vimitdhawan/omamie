"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as service from "./service";
import {
  matchIdSchema,
  proposeViewingSlotsSchema,
  confirmViewingSlotSchema,
} from "./schema";

export async function getViewingsForMatchAction(matchId: string) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  const validMatchId = matchIdSchema.parse(matchId);
  return service.getViewingsForMatch(validMatchId, session.profileId);
}

export async function proposeViewingSlotsAction(
  matchId: string,
  slots: string[]
) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const validInput = proposeViewingSlotsSchema.parse({ matchId, slots });
  const result = await service.proposeViewingSlots(
    validInput.matchId,
    session.profileId,
    validInput.slots
  );
  revalidatePath("/matches");
  return result;
}

export async function confirmViewingSlotAction(
  matchId: string,
  viewingId: string
) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  const validInput = confirmViewingSlotSchema.parse({ matchId, viewingId });
  const result = await service.confirmViewingSlot(
    validInput.matchId,
    validInput.viewingId,
    session.profileId
  );
  revalidatePath("/matches");
  return result;
}
