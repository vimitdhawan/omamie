"use server";

import {
  loginSchema,
  signupFormSchema,
  SignupActionState,
  LoginActionState,
} from "./schema";
import { login, signup, logout } from "./service";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppError } from "@/lib/errors";

export async function loginAction(
  _prev: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const raw = {
    email: (formData.get("email") ?? "") as string,
    password: (formData.get("password") ?? "") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as {
        email?: string[];
        password?: string[];
      },
    };
  }

  try {
    const result = await login(parsed.data);
    if (result.success) {
      redirect("/dashboard");
    }
    return result as LoginActionState;
  } catch (error) {
    if (isAppError(error)) {
      return { error: error.message };
    }

    console.error("Unexpected error during login:", error);
    return {
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
