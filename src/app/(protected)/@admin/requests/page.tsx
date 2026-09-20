import { getAllMatches } from "@/features/admin/requests/service";
import { AdminRequestsTable } from "@/features/admin/requests/components/admin-requests-table";

export default async function AdminRequestsPage() {
  const matches = await getAllMatches();

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Matching Requests
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          See every tenant interest and its current status across the platform.
        </p>
      </div>

      <AdminRequestsTable matches={matches} />
    </div>
  );
}
