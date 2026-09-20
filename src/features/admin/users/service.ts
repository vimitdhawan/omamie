import { requireAdmin } from "../shared/auth";
import { listAllUsers } from "./repository";
import type { AdminUserFilter } from "./types";

export async function getAllUsers(filters?: AdminUserFilter) {
  await requireAdmin();
  return await listAllUsers(filters);
}
