import { getAllMatches } from "@/features/admin/requests/service";
import { AdminRequestsTable } from "@/features/admin/requests/components/admin-requests-table";

export default async function AdminRequestsPage() {
  const matches = await getAllMatches();

  return (
    <div className="flex-1 space-y-8 p-8">
      <AdminRequestsTable matches={matches} />
    </div>
  );
}
