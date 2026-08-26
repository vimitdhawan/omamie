"use server";

import {
  signUp as repoSignUp,
  signIn as repoSignIn,
  signOut as repoSignOut,
  getUser as repoGetUser,
} from "./repository";
import { getProfile as profileServiceGetProfile } from "@/features/profile/service";
import type { SignUpInput, LoginInput, AuthActionResult } from "./types";

export async function signup(input: SignUpInput) {
  return await repoSignUp(input);
}

export async function login(input: LoginInput): Promise<AuthActionResult> {
  await repoSignIn(input.email, input.password);
  return { success: true };
}

export async function logout(): Promise<AuthActionResult> {
  await repoSignOut();
  return { success: true };
}

export async function getCurrentUser() {
  const { user, error } = await repoGetUser();
  if (error || !user) return { user: null, profile: null };

  const profile = await profileServiceGetProfile(user.id);
  return { user, profile };
}
