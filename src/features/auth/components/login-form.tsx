"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/features/auth/actions";
import { LoginActionState } from "@/features/auth/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [clearedFields, setClearedFields] = useState<Set<string>>(new Set());

  const [state, formAction, isPending] = useActionState<
    LoginActionState | null,
    FormData
  >(loginAction, null);

  if (state?.error) {
    toast.error(state.error);
  }

  const getFieldError = (fieldName: "email" | "password") => {
    if (clearedFields.has(fieldName)) {
      return undefined;
    }
    return state?.errors?.[fieldName];
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <Field
            data-invalid={
              !!(getFieldError("email") && getFieldError("email")!.length > 0)
            }
          >
            <FieldLabel htmlFor="email">
              Email <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={
                !!(getFieldError("email") && getFieldError("email")!.length > 0)
              }
              onChange={() => {
                setClearedFields((prev) => new Set([...prev, "email"]));
              }}
            />
            {getFieldError("email") && getFieldError("email")!.length > 0 && (
              <FieldError
                errors={getFieldError("email")!.map((msg) => ({
                  message: msg,
                }))}
              />
            )}
          </Field>
          <Field
            data-invalid={
              !!(
                getFieldError("password") &&
                getFieldError("password")!.length > 0
              )
            }
          >
            <FieldLabel htmlFor="password">
              Password <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative">
              <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="pr-10 pl-10"
                aria-invalid={
                  !!(
                    getFieldError("password") &&
                    getFieldError("password")!.length > 0
                  )
                }
                onChange={() => {
                  setClearedFields((prev) => new Set([...prev, "password"]));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {getFieldError("password") &&
              getFieldError("password")!.length > 0 && (
                <FieldError
                  errors={getFieldError("password")!.map((msg) => ({
                    message: msg,
                  }))}
                />
              )}
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-muted-foreground text-sm">
            {"Don't have an account? "}
            <Link
              href="/signup"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
