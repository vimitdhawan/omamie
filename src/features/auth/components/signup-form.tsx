"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { signupFormSchema, SignupActionState, SignupFormData } from "../schema";
import { handleSignup } from "../actions";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export interface SignupFormProps {
  // Role is already resolved before this component renders
  role: "tenant" | "agent" | "owner";
}

export function SignupForm({ role }: SignupFormProps) {
  const description =
    role === "tenant"
      ? "Join Omamie to find your next home."
      : "Join Omamie to start managing your properties";

  // Password visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(handleSignup, {
    errors: {},
  } as SignupActionState);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: role,
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof SignupFormData, {
          type: "manual",
          message: Array.isArray(messages) ? messages.join("\n") : messages,
        });
      });
    }
    if (state.errorMessage) {
      toast.error(state.errorMessage);
    }
  }, [state, form]);

  return (
    <Card className="bg-surface-soft/50 w-full max-w-sm">
      <Form {...form}>
        <form action={formAction}>
          <CardHeader className="text-center">
            <CardTitle className="text-display-xl">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-body-md text-muted">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="John Doe"
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("fullName");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="m@example.com"
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("email");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field with Toggle */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        className="!pr-10 !pl-10"
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
                  </FormControl>
                  <FormMessage className="whitespace-pre-line" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        className="!pr-10 !pl-10"
                        onChange={(e) => {
                          field.onChange(e);
                          form.clearErrors("confirmPassword");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                  </FormControl>
                  <FormMessage className="whitespace-pre-line" />
                </FormItem>
              )}
            />
            {/* Hidden Role Input */}
            <input type="hidden" name="role" value={role} />
          </CardContent>
          <CardFooter className="bg-surface-strong flex flex-col">
            <Button type="submit" className="w-full cursor-pointer">
              {isPending ? "Creating account..." : "Create account"}
            </Button>
            {/* Login Link */}
            <div className="pt-4 text-center">
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
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
