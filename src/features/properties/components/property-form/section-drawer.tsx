"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFormState, useWatch, type UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SECTION_FIELDS,
  validateSection,
  type PropertyFormValues,
  type PropertySection,
} from "../../schema";

/**
 * Fields whose error should follow another field's touched state, because the owner never
 * edits them directly. Coordinates arrive only by picking a location suggestion.
 */
const NON_BLOCKING_SOURCE: Partial<
  Record<keyof PropertyFormValues, keyof PropertyFormValues>
> = {
  latitude: "location",
  longitude: "location",
};

interface SectionDrawerProps {
  section: PropertySection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** 1-based position, shown as "STEP n OF m". */
  step: number;
  totalSteps: number;
  form: UseFormReturn<PropertyFormValues>;
  /** Fired when the section closes through Save, not through Cancel. */
  onSaved?: () => void;
  children: ReactNode;
}

/**
 * A drawer that will not close over invalid input.
 *
 * Closing by any route other than Cancel runs the section's fields through the form
 * resolver first; if anything fails the drawer stays open with the errors showing, so a
 * broken section can never be carried into a save. Cancel restores the values captured when
 * the drawer opened.
 */
export function SectionDrawer({
  section,
  open,
  onOpenChange,
  title,
  description,
  step,
  totalSteps,
  form,
  onSaved,
  children,
}: SectionDrawerProps) {
  const isMobile = useIsMobile();
  const snapshot = useRef<PropertyFormValues | null>(null);
  const fields = SECTION_FIELDS[
    section
  ] as readonly (keyof PropertyFormValues)[];

  // Subscribing to the section's own fields is purely a re-render trigger -- useWatch with
  // a name array returns an array, not a value object -- so the values themselves come from
  // getValues(), which is current at render time. This keeps `missing` live, so Save
  // re-enables the moment the last required field is filled.
  useWatch({ control: form.control, name: fields as never });
  // formState is a proxy: without subscribing here, getFieldState would report stale
  // dirty/touched flags and no error would ever be revealed.
  const { dirtyFields, touchedFields, errors } = useFormState({
    control: form.control,
  });
  const missing = validateSection(section, form.getValues());
  // Only the subset the owner can actually fill in here gates Save — see
  // NON_BLOCKING_FIELDS.
  const blocking = validateSection(section, form.getValues(), {
    blockingOnly: true,
  });
  const missingFields = Object.keys(blocking) as (keyof PropertyFormValues)[];
  const canSave = missingFields.length === 0;

  // Errors appear as the owner works, not the instant a section opens — a pristine drawer
  // full of red is just noise. `revealAll` flips when they try to leave an incomplete
  // section, so nothing stays hidden at the point it actually matters.
  const [revealAll, setRevealAll] = useState(false);

  // Reset on each open, adjusted during render rather than in an effect so the drawer's
  // first paint is already clean.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setRevealAll(false);
  }

  useEffect(() => {
    if (!open) return;
    if (!snapshot.current) {
      snapshot.current = form.getValues();
    }
    // Start from a clean slate: anything left over from a previous visit to this section
    // would otherwise read as a brand-new complaint.
    form.clearErrors([...fields]);
    // Only on open; the reveal effect below handles everything after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section]);

  useEffect(() => {
    if (!open) return;

    for (const field of fields) {
      const message = missing[field];
      // Coordinates are never typed, so they follow whether the location field has been
      // edited rather than their own (always-pristine) state.
      const source = NON_BLOCKING_SOURCE[field] ?? field;
      // Dirty alone is not enough: clearing a field back to its default makes it clean
      // again, so "typed a rent then deleted it" would silently show nothing.
      const shown =
        revealAll ||
        Boolean(dirtyFields[source]) ||
        Boolean(touchedFields[source]);

      if (message && shown && errors[field]?.message !== message) {
        form.setError(field, { message });
      }
    }
  });

  const commit = async () => {
    // Format rules (the resolver) and completeness rules are separate checks: the resolver
    // stays lenient so a partial draft can always be saved from outside the drawer.
    const formatValid = await form.trigger([...fields]);
    if (!formatValid || !canSave) {
      setRevealAll(true);
      return false;
    }

    snapshot.current = null;
    onOpenChange(false);
    onSaved?.();
    return true;
  };

  const cancel = () => {
    if (snapshot.current) {
      form.reset(snapshot.current);
    }
    snapshot.current = null;
    form.clearErrors([...SECTION_FIELDS[section]]);
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      // Dismissing by overlay, Escape or swipe goes through the same gate as Done.
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        void commit();
      }}
      swipeDirection={isMobile ? "down" : "right"}
      showSwipeHandle={isMobile}
    >
      <DrawerContent
        className={
          isMobile
            ? "max-h-[92svh]"
            : "inset-y-0 right-0 h-full w-full max-w-xl sm:max-w-xl"
        }
      >
        <DrawerHeader>
          <p className="text-primary text-uppercase-tag flex items-center gap-1.5 tracking-wider uppercase">
            <span className="bg-primary size-1.5 rounded-full" aria-hidden />
            Step {step} of {totalSteps}
          </p>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4">
          {children}
        </div>

        <DrawerFooter className="flex-row items-center justify-between gap-2 border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex min-w-0 items-center gap-2">
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            {!canSave && (
              <p className="text-muted-foreground truncate text-xs">
                {missingFields.length} field
                {missingFields.length === 1 ? "" : "s"} still needed
              </p>
            )}
          </div>
          {/* Saving a draft lives once, outside the drawers, so there is a single place
              that writes to the server. This button only closes the section. */}
          <Button
            type="button"
            onClick={() => void commit()}
            disabled={!canSave}
            className="gap-1.5"
          >
            <Check className="size-4" />
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
