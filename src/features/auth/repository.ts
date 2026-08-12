import { createClient } from "@/lib/supabase/server";
import type { SignUpInput, Profile } from "./types";
import { AppError } from "@/lib/errors";

function mapSupabaseErrorToAppError(error: {
  message?: string;
  status?: number;
}): AppError {
  const message = error.message || "";
  const status = error.status !== undefined ? error.status : 500;

  if (
    message.includes("duplicate key") ||
    message.includes("already registered")
  ) {
    return new AppError(
      "CONFLICT",
      "An account with this email already exists",
      409
    );
  }

  if (message.includes("Invalid login credentials")) {
    return new AppError("UNAUTHORIZED", "Invalid email or password", 401);
  }

  if (message.includes("Email not confirmed")) {
    return new AppError(
      "UNAUTHORIZED",
      "Please confirm your email address before signing in",
      401
    );
  }

  if (status >= 500) {
    return new AppError(
      "INTERNAL_ERROR",
      "Server error occurred. Please try again later",
      status
    );
  }

  if (
    status === 0 ||
    message.includes("network") ||
    message.includes("timeout")
  ) {
    return new AppError(
      "EXTERNAL_SERVICE_ERROR",
      "Network connection failed. Please check your internet and try again",
      0
    );
  }

  return new AppError(
    "INTERNAL_ERROR",
    "An unexpected error occurred. Please try again",
    status
  );
}

export async function signUp(input: SignUpInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: input.role,
      },
    },
  });

  if (error) {
    throw mapSupabaseErrorToAppError(error);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw mapSupabaseErrorToAppError(error);
  }

  return data;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw mapSupabaseErrorToAppError(error);
  }
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { profile: null, error };
  return { profile: data as Profile, error: null };
}
