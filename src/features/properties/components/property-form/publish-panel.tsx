"use client";

import { Controller, useFormState, type UseFormReturn } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { ProgressRing } from "./progress-ring";
import type { PropertyFormValues } from "../../schema";
import type { PropertyStatus } from "../../types";

interface PublishPanelProps {
  form: UseFormReturn<PropertyFormValues>;
  readyCount: number;
  totalSections: number;
  /** Which action is in flight, so only that button spins while both disable. */
  pendingIntent: "draft" | "publish" | null;
  status?: PropertyStatus;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "Draft",
  pending: "Draft",
  review: "In review",
  active: "Published",
  inactive: "Inactive",
  rented: "Rented",
};

/**
 * Progress and the two save actions, sitting after the sections.
 *
 * Deliberately not `fixed` to the viewport: the previous bottom bar was
 * `fixed inset-x-0 bottom-0 z-20` and the sidebar container is z-10, so it painted over the
 * sidebar's user footer. Keeping this in normal flow removes that class of bug.
 */
export function PublishPanel({
  form,
  readyCount,
  totalSections,
  pendingIntent,
  status,
  onSaveDraft,
  onPublish,
}: PublishPanelProps) {
  const { control } = form;
  const { errors } = useFormState({ control });
  const progress = totalSections === 0 ? 0 : readyCount / totalSections;
  const allReady = readyCount === totalSections;

  return (
    <div className="bg-card border-hairline-soft mt-6 rounded-xl border p-5">
      <div className="flex items-center gap-4">
        <ProgressRing value={progress} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              {readyCount} of {totalSections} sections ready
            </p>
            {status && (
              <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>
            )}
          </div>
          <p
            className={`mt-1 text-sm ${allReady ? "text-success" : "text-muted-foreground"}`}
          >
            {allReady
              ? "Ready to publish"
              : "Fill in the remaining sections to publish"}
          </p>
        </div>
      </div>

      <div className="border-hairline-soft mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <Label className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  I accept the terms
                </Label>
              )}
            />
            <Controller
              control={control}
              name="confirmAccuracy"
              render={({ field }) => (
                <Label className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  The details are accurate
                </Label>
              )}
            />
          </div>
          <FieldError
            errors={[errors.acceptTerms, errors.confirmAccuracy].filter(
              Boolean
            )}
          />
        </div>

        <div className="flex shrink-0 gap-2">
          {/* A draft never runs the publish rules, so partial work can always be parked.
              On a new listing this is what creates the row and its id. */}
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={pendingIntent !== null}
            className="gap-1.5"
          >
            {pendingIntent === "draft" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save draft
          </Button>
          <Button
            type="button"
            onClick={onPublish}
            disabled={pendingIntent !== null}
            className="gap-1.5"
          >
            {pendingIntent === "publish" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
