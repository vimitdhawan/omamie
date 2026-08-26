import { getProfile as repoGetProfile } from "./repository";
import type { Profile } from "./types";

export async function getProfile(userId: string) {
  const { profile } = await repoGetProfile(userId);
  return profile as Profile | null;
}
