"use server";

import { loginSchema, signupFormSchema, SignupActionState } from "./schema";
import { login, signup, logout } from "./service";
import type { AuthActionResult } from "./types";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppError } from "@/lib/errors";

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

  try {
    const result = await login(parsed.data);
    if (result.success) {
      redirect("/dashboard");
    }
    return result;
  } catch (error) {
    if (isAppError(error)) {
      return { success: false, error: error.message };
    }

    console.error("Unexpected error during login:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later",
    };
  }
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

  try {
    await signup({ email, password, fullName, role });
    redirect("/dashboard");
  } catch (error) {
    if (isAppError(error)) {
      return {
        errorMessage: error.message,
      };
    }
    return {
      errorMessage: "An unexpected error occurred. Please try again later",
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await logout();
  } catch (error) {
    if (isAppError(error)) {
      console.error("Logout failed:", error.message);
    } else {
      console.error("Unexpected error during logout:", error);
    }
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/login");
}
