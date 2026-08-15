"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/features/auth/actions";
import {
  LoginActionState,
  loginFormSchema,
  LoginFormData,
} from "@/features/auth/schema";
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

  const [state, formAction, isPending] = useActionState<
    LoginActionState | null,
    FormData
  >(loginAction, null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
  }, [state]);

  return (
    <Card className="bg-surface-soft/50 w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-display-xl">Welcome back</CardTitle>
        <CardDescription className="text-body-md text-muted">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6 pt-6">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("email");
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Password <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="relative">
                  <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pr-10 pl-10"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("password");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {fieldState.invalid && fieldState.error?.message && (
                  <FieldError
                    errors={fieldState.error.message
                      .split("\n")
                      .filter(Boolean)
                      .map((msg) => ({ message: msg.trim() }))}
                  />
                )}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="bg-surface-strong mt-8 flex flex-col">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-muted-foreground pt-4 text-sm">
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
