import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import {
  getPropertiesList,
  getPropertiesCountByStatus,
} from "@/features/properties/repository";
import Link from "next/link";

type PropertyStatus = "active" | "pending" | "rented" | "inactive";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const params = await searchParams;
  const properties = await getPropertiesList(session.profileId, {
    status: params.status as PropertyStatus | undefined,
    search: params.search,
  });
  const counts = await getPropertiesCountByStatus(session.profileId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-border border-b p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-foreground text-[28px] font-bold">
              Properties
            </h2>
            <p className="text-muted-foreground mt-1 text-[16px]">
              Manage your property listings.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border mb-4 flex gap-4 border-b">
          <Link
            href="/properties"
            className="border-primary text-primary border-b-2 pb-2 text-[16px] font-semibold"
          >
            All ({counts.all})
          </Link>
          <Link
            href="/properties?status=active"
            className="text-muted-foreground hover:text-primary pb-2 text-[16px]"
          >
            Listed ({counts.active})
          </Link>
          <Link
            href="/properties?status=pending"
            className="text-muted-foreground hover:text-primary pb-2 text-[16px]"
          >
            Draft ({counts.draft})
          </Link>
          <Link
            href="/properties?status=rented"
            className="text-muted-foreground hover:text-primary pb-2 text-[16px]"
          >
            Rented ({counts.rented})
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            placeholder="Search properties..."
            className="border-border bg-background focus:border-primary focus:ring-primary h-10 w-full rounded-lg border pr-4 pl-10 text-[14px] focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-6">
        {properties.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-[16px]">
                No properties found.
              </p>
              <Link
                href="/properties/create"
                className="text-primary mt-4 inline-flex items-center gap-2 text-[16px] font-semibold hover:underline"
              >
                <span className="material-symbols-outlined">add</span>
                Create your first property
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="border-border bg-card hover:bg-muted/50 rounded-xl border p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-foreground text-[16px] font-semibold">
                    {property.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      property.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
                <p className="text-muted-foreground mb-2 flex items-center gap-1 text-[14px]">
                  <span className="material-symbols-outlined text-[16px]">
                    location_on
                  </span>
                  {property.location}
                </p>
                <div className="text-muted-foreground mb-3 flex gap-3 text-[14px]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      bed
                    </span>
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      shower
                    </span>
                    {property.bathrooms}
                  </span>
                </div>
                <p className="text-foreground text-[18px] font-bold">
                  ${property.monthlyRent.toLocaleString()}
                  <span className="text-muted-foreground text-[14px] font-normal">
                    /mo
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
