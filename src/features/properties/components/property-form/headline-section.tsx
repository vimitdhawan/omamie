"use client";

import { useFormState, type UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";
import type { PropertyFormValues } from "../../schema";
import { Input } from "@/components/ui/input";

/** Step 5 — the marketing copy. Written last, once the specs are known. */
export function HeadlineSection({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { register, control } = form;
  // See basics-section.tsx: `form.formState` off a stable prop does not re-render.
  const { errors } = useFormState({ control });

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Listing headline</Label>
        <Input
          id="title"
          placeholder="e.g., Bright 2-bedroom condo near BTS Thonglor"
          {...register("title")}
        />
        <p className="text-muted-foreground text-xs">
          This is the first line a tenant reads in search results.
        </p>
        <FieldError errors={errors.title ? [errors.title] : undefined} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={7}
          placeholder="What makes this place worth renting? Mention the view, the commute, and what is nearby."
          {...register("description", {
            // "" clears a saved description rather than being read as "not submitted".
            setValueAs: (value) => (value === "" ? null : value),
          })}
        />
        <FieldError
          errors={errors.description ? [errors.description] : undefined}
        />
      </div>
    </div>
  );
}
