import { z } from "zod";

export const matchIdSchema = z.string().uuid("Invalid match ID");
export const viewingIdSchema = z.string().uuid("Invalid viewing ID");

/** A tenant proposes several candidate times at once (the mock's "share your available
 * times"); the owner then confirms one. */
export const proposeViewingSlotsSchema = z.object({
  matchId: matchIdSchema,
  slots: z
    .array(z.string().min(1, "Pick a date and time"))
    .min(1, "Add at least one time")
    .max(5, "Add at most 5 times"),
});

export const confirmViewingSlotSchema = z.object({
  matchId: matchIdSchema,
  viewingId: viewingIdSchema,
});
