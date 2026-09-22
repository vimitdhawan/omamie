"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  requirementsFormSchema,
  type RequirementsFormData,
  type RequirementsActionState,
} from "../schema";
import type { TenantProfile, TenantRequirements } from "../types";
import { handleSaveRequirements } from "../actions";
import { RequirementsSuccess } from "./requirements-success";
import {
  AboutYouSection,
  LookingForSection,
  PreferencesSection,
  buildRequirementsDefaults,
} from "./requirements-fields";

interface RequirementsFormProps {
  initialProfile: TenantProfile | null;
  initialRequirements: TenantRequirements | null;
}

export function RequirementsForm({
  initialProfile,
  initialRequirements,
}: RequirementsFormProps) {
  const [state, formAction, isPending] = useActionState(
    handleSaveRequirements,
    {} as RequirementsActionState
  );

  const form = useForm({
    resolver: zodResolver(requirementsFormSchema),
    mode: "onBlur",
    defaultValues: buildRequirementsDefaults(
      initialProfile,
      initialRequirements
    ),
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.success) {
    return <RequirementsSuccess />;
  }

  return (
    <Card className="bg-surface-soft/50 border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl">Find Property</CardTitle>
        <CardDescription className="text-base">
          Tell owners a bit about yourself and what you&apos;re looking for.
          This is what owners see on your requests instead of your contact
          details.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <AboutYouSection form={form} disabled={isPending} />
        </CardContent>

        <CardContent className="border-border space-y-6 border-t pt-6">
          <LookingForSection form={form} disabled={isPending} />
        </CardContent>

        <CardContent className="border-border space-y-6 border-t pt-6">
          <PreferencesSection form={form} disabled={isPending} />
        </CardContent>

        <CardFooter className="bg-surface-strong mt-8 flex flex-col gap-4">
          <div className="flex w-full justify-end">
            <Button
              type="submit"
              className="cursor-pointer px-4"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
