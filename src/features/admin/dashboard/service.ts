import { requireAdmin } from "../shared/auth";
import { getReviewQueue } from "../properties/service";
import { getDashboardCounts } from "./repository";

export async function getDashboardSummary() {
  await requireAdmin();
  const [counts, reviewQueue] = await Promise.all([
    getDashboardCounts(),
    getReviewQueue(),
  ]);
  return { counts, reviewQueue };
}
