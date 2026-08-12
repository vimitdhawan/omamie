"use server";

import { loginSchema, signupFormSchema, SignupActionState } from "./schema";
import { login, signup, logout } from "./service";
import type { AuthActionResult } from "./types";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function extractFirstError(issues: Array<{ message: string }>): string {
  return issues[0]?.message ?? "Invalid input";
}

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    email: (formData.get("email") ?? "") as string,
    password: (formData.get("password") ?? "") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: extractFirstError(parsed.error.issues) };
  }

  const result = await login(parsed.data);
  if (result.success) {
    redirect("/dashboard");
  }
  return result;
}

export async function handleSignup(
  _prev: SignupActionState | null,
  formData: FormData
): Promise<SignupActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = signupFormSchema.safeParse(form);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName, role } = validationResult.data;
  const result = await signup({ email, password, fullName, role });

  if (result.success && !result.message) {
    redirect("/dashboard");
  }
  return result;
}

export async function logoutAction(): Promise<void> {
  const result = await logout();
  if (!result.success) {
    console.error("Logout failed, forcing session clear:", result.error);
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/login");
}
