import { requireAdmin } from "../shared/auth";
import { listAllMatches } from "./repository";
import type { AdminMatchFilter } from "./types";

export async function getAllMatches(filters?: AdminMatchFilter) {
  await requireAdmin();
  return await listAllMatches(filters);
}
