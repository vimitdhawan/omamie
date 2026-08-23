"use server";

import {
  loginFormSchema,
  signupFormSchema,
  SignupActionState,
  LoginActionState,
} from "./schema";
import { login, signup, logout, getCurrentUser } from "./service";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppError } from "@/lib/errors";

export async function loginAction(
  _prev: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = loginFormSchema.safeParse(form);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { email, password } = validationResult.data;

  try {
    const result = await login({ email, password });
    if (!result.success) {
      return result as LoginActionState;
    }
    await getCurrentUser();
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    console.error("Unexpected error during login:", error);
    return {
      errorMessage: "An unexpected error occurred. Please try again later",
    };
  }

  redirect("/list-property");
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

  redirect("/list-property");
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
