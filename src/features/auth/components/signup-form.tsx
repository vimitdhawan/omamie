"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/Logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signupAction } from "@/features/auth/actions";
import type { AuthActionResult } from "@/features/auth/types";

interface SignupFormProps {
  intent?: "list-property" | "find-property";
}

export function SignupForm({ intent = "list-property" }: SignupFormProps) {
  // State for role selection (only relevant if list-property)
  const [selectedRole, setSelectedRole] = useState<"agent" | "owner" | null>(
    null
  );

  const description =
    intent === "find-property"
      ? "Join Omamie to find your next home."
      : "Join Omamie to start managing your properties";

  // Password visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form action state
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signupAction, null);

  // Derive final role based on intent
  const finalRole = intent === "find-property" ? "tenant" : selectedRole;

  // Can only submit if role is selected (for list-property) or if find-property
  const canSubmit = intent === "find-property" || selectedRole !== null;

  return (
    <Card>
      <CardHeader className="text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>
        <CardTitle className="text-display-xl">Create Your Account</CardTitle>
        <CardDescription className="text-body-md text-muted">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error/Success Messages */}
        {state?.error && (
          <div className="border-destructive/50 bg-destructive/10 text-destructive px-base py-sm text-body-sm mb-lg rounded-lg border">
            {state.error}
          </div>
        )}

        {state?.message && (
          <div className="border-primary/30 bg-primary/5 text-foreground px-base py-sm text-body-sm mb-lg rounded-lg border">
            {state.message}
          </div>
        )}

        {/* Form */}
        <form action={formAction}>
          <FieldGroup>
            {/* Full Name Field */}
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Jane Doe"
                className="h-[44px]"
                required
              />
            </Field>

            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="h-[44px]"
                required
              />
            </Field>

            {/* Password Field with Toggle */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="h-[44px] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="font-material-symbols text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </Field>

            {/* Confirm Password Field with Toggle */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="h-[44px] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <span className="font-material-symbols text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </Field>

            {/* Role Selection - Conditional (only for list-property) */}
            {intent === "list-property" && (
              <>
                <Separator className="my-2" />

                <Field>
                  <FieldLabel>Select your role</FieldLabel>
                  <RadioGroup
                    value={selectedRole || ""}
                    onValueChange={(value) => {
                      setSelectedRole(value as "agent" | "owner");
                    }}
                    className="mt-2 space-y-3"
                  >
                    {/* Agent Card */}
                    <label className="gap-base p-base border-hairline bg-canvas hover:border-primary flex items-start rounded-lg border-2 transition-all hover:cursor-pointer">
                      <RadioGroupItem value="agent" id="agent" />
                      <div className="gap-xs flex flex-col">
                        <span className="text-foreground font-semibold">
                          Agent
                        </span>
                        <span className="text-caption-sm font-caption-sm text-muted">
                          I manage properties for others
                        </span>
                      </div>
                    </label>

                    {/* Owner Card */}
                    <label className="gap-base p-base border-hairline bg-canvas hover:border-primary flex items-start rounded-lg border-2 transition-all hover:cursor-pointer">
                      <RadioGroupItem value="owner" id="owner" />
                      <div className="gap-xs flex flex-col">
                        <span className="text-foreground font-semibold">
                          Owner
                        </span>
                        <span className="text-caption-sm font-caption-sm text-muted">
                          I own and manage my properties
                        </span>
                      </div>
                    </label>
                  </RadioGroup>
                </Field>
              </>
            )}

            {/* Hidden Role Input */}
            {finalRole && <input type="hidden" name="role" value={finalRole} />}

            {/* Submit Button */}
            <Field className="mt-6">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary-active text-nav-link h-12 w-full rounded-lg font-semibold"
                disabled={!canSubmit || isPending}
              >
                {isPending ? "Creating account..." : "Create account"}
              </Button>
            </Field>

            {/* Login Link */}
            <div className="text-center">
              <p className="font-body-sm text-body-sm text-muted">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold transition-colors hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
