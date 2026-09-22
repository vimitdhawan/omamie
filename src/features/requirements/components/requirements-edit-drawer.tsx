"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  requirementsFormSchema,
  type RequirementsFormData,
  type RequirementsActionState,
} from "../schema";
import type { TenantProfile, TenantRequirements } from "../types";
import { handleSaveRequirements } from "../actions";
import {
  AboutYouSection,
  LookingForSection,
  PreferencesSection,
  buildRequirementsDefaults,
} from "./requirements-fields";

interface RequirementsEditDrawerProps {
  profile: TenantProfile | null;
  requirements: TenantRequirements | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Creates or edits the tenant's single search request in a right-side drawer, rather than
 * sending them to the full `/find-property` page. Reuses the same three form sections and
 * the same `handleSaveRequirements` action as that page — create and edit are both just an
 * upsert of the same one-row-per-tenant data, so one drawer covers both, switching its copy
 * based on whether `requirements` is null.
 */
export function RequirementsEditDrawer({
  profile,
  requirements,
  open,
  onOpenChange,
}: RequirementsEditDrawerProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const isCreating = requirements === null;
  const [state, formAction, isPending] = useActionState(
    handleSaveRequirements,
    {} as RequirementsActionState
  );

  const form = useForm({
    resolver: zodResolver(requirementsFormSchema),
    mode: "onBlur",
    defaultValues: buildRequirementsDefaults(profile, requirements),
  });

  // Re-sync whenever the drawer is (re)opened, so a previous edit or a stale action
  // state never leaks into the next visit.
  useEffect(() => {
    if (open) {
      form.reset(buildRequirementsDefaults(profile, requirements));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof RequirementsFormData, {
          type: "manual",
          message: messages?.join(", "),
        });
      });
    }
    if (state?.success) {
      toast.success(
        isCreating ? "Search request created" : "Search request updated"
      );
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
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
          <DrawerTitle>
            {isCreating ? "Create Search Request" : "Edit Search Request"}
          </DrawerTitle>
          <DrawerDescription>
            {isCreating
              ? "Tell owners a bit about yourself and what you're looking for. This is what they see instead of your contact details."
              : "Update what you're looking for. Owners see this instead of your contact details."}
          </DrawerDescription>
        </DrawerHeader>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pt-2 pb-4">
            <AboutYouSection form={form} disabled={isPending} />
            <div className="border-border space-y-6 border-t pt-6">
              <LookingForSection form={form} disabled={isPending} />
            </div>
            <div className="border-border space-y-6 border-t pt-6">
              <PreferencesSection form={form} disabled={isPending} />
            </div>
          </div>

          <DrawerFooter className="flex-row items-center justify-end gap-2 border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isCreating ? "Create Request" : "Save changes"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
