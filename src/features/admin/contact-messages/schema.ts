import { z } from "zod";

/** Completed messages can only ever be queried a window at a time — never the whole history. */
export const MAX_COMPLETED_RANGE_DAYS = 92;

export const completeContactMessageSchema = z.object({
  id: z.uuid(),
  resolutionNote: z
    .string()
    .trim()
    .min(1, "Please describe how this was resolved")
    .max(2000, "Resolution note must be less than 2000 characters"),
});

export type CompleteContactMessageInput = z.infer<
  typeof completeContactMessageSchema
>;

export const completedRangeSchema = z
  .object({
    from: z.iso.date("Enter a valid start date"),
    to: z.iso.date("Enter a valid end date"),
  })
  .refine((range) => new Date(range.from) <= new Date(range.to), {
    message: "Start date must be before the end date",
    path: ["from"],
  })
  .refine(
    (range) => {
      const spanMs =
        new Date(range.to).getTime() - new Date(range.from).getTime();
      const spanDays = spanMs / (1000 * 60 * 60 * 24);
      return spanDays <= MAX_COMPLETED_RANGE_DAYS;
    },
    {
      message: `Completed messages can only be viewed in a window of up to ${MAX_COMPLETED_RANGE_DAYS} days`,
      path: ["to"],
    }
  );

export type CompletedRangeInput = z.infer<typeof completedRangeSchema>;
