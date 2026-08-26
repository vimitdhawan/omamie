"use server";

import {
  loginFormSchema,
  signupFormSchema,
  SignupActionState,
  LoginActionState,
} from "./schema";
import { login, signup } from "./service";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  setAuthSession,
  deleteAuthSession,
  getRoleBasedRedirectPath,
} from "@/lib/auth-session";
import { getUserWithProfile } from "@/features/profile/repository";
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
  let redirectPath: string | null = null;

  try {
    const result = await login({ email, password });
    if (!result.success) {
      return result as LoginActionState;
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "Authentication failed. Please try again." };
    }

    const profile = await getUserWithProfile(supabase, user.id);
    if (!profile) {
      return { errorMessage: "Failed to load profile. Please try again." };
    }

    await setAuthSession(profile.id, profile.role);
    redirectPath = getRoleBasedRedirectPath(profile.role);
  } catch (error) {
    if (isAppError(error)) {
      return { errorMessage: error.message };
    }
    return {
      errorMessage: "An unexpected error occurred. Please try again later",
    };
  }

  if (redirectPath) redirect(redirectPath);
  return {
    errorMessage: "An unexpected error occurred. Please try again later",
  };
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
  let redirectPath: string | null = null;

  try {
    await signup({ email, password, fullName, role });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "Authentication failed. Please try again." };
    }

    const profile = await getUserWithProfile(supabase, user.id);
    if (!profile) {
      return { errorMessage: "Failed to load profile. Please try again." };
    }

    await setAuthSession(profile.id, profile.role);
    redirectPath = getRoleBasedRedirectPath(profile.role);
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

  if (redirectPath) redirect(redirectPath);
  return {
    errorMessage: "Signup failed. Please try again.",
  };
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Silently handle logout errors
  }

  await deleteAuthSession();
  redirect("/login");
}
