import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function ViewingRequestsPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  // Placeholder - will fetch real data when viewing_requests table is populated
  const requests: unknown[] = [];

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] font-bold">
          Viewing Requests
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px]">
          Review and coordinate incoming viewing requests from prospective
          tenants.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-4 border-b">
        <button className="border-primary text-primary border-b-2 pb-2 text-[16px] font-semibold">
          Pending (0)
        </button>
        <button className="text-muted-foreground hover:text-primary pb-2 text-[16px]">
          Upcoming (0)
        </button>
        <button className="text-muted-foreground hover:text-primary pb-2 text-[16px]">
          Completed (0)
        </button>
        <button className="text-muted-foreground hover:text-primary pb-2 text-[16px]">
          Cancelled (0)
        </button>
      </div>

      {/* Table */}
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="p-4">
          <div className="relative">
            <span className="material-symbols-outlined text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              placeholder="Search name or property..."
              className="border-border bg-background focus:border-primary focus:ring-primary h-10 w-full rounded-lg border pr-4 pl-10 text-[14px] focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-[14px]">
              No viewing requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-border bg-muted/50 border-b">
                <tr>
                  <th className="text-foreground px-4 py-3 text-left text-[14px] font-semibold">
                    Requester
                  </th>
                  <th className="text-foreground px-4 py-3 text-left text-[14px] font-semibold">
                    Property
                  </th>
                  <th className="text-foreground px-4 py-3 text-left text-[14px] font-semibold">
                    Requested Time
                  </th>
                  <th className="text-foreground px-4 py-3 text-left text-[14px] font-semibold">
                    Status
                  </th>
                  <th className="text-foreground px-4 py-3 text-right text-[14px] font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {/* Rows will be rendered here */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
