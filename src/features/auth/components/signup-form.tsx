"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/features/auth/actions";
import type { AuthActionResult } from "@/features/auth/types";
import { USER_ROLE_OPTIONS } from "@/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signupAction, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Get started with your Omamie account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
              {state.error}
            </div>
          )}
          {state?.message && (
            <div className="border-primary/30 bg-primary/5 text-foreground rounded-lg border px-3 py-2 text-sm">
              {state.message}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="tenant">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
