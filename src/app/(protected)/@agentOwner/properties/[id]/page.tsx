import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getPropertyById } from "@/features/properties/repository";
import Link from "next/link";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property || property.profileId !== session.profileId) {
    redirect("/properties");
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-foreground text-[36px] font-bold">
              {property.title}
            </h1>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                property.status === "active"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {property.status}
            </span>
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-[18px]">
            <span className="material-symbols-outlined text-[20px]">
              location_on
            </span>
            {property.location}
          </p>
        </div>
        <div className="text-right">
          <div className="text-primary text-[36px] font-bold">
            ${property.monthlyRent.toLocaleString()}
            <span className="text-muted-foreground text-[18px] font-normal">
              /mo
            </span>
          </div>
          <Link
            href={`/properties/${property.id}/edit`}
            className="bg-primary text-primary-foreground hover:bg-primary/80 mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[14px] font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Edit Property
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Property Details */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 text-[21px] font-bold">
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    bed
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-[14px]">Bedrooms</p>
                  <p className="text-foreground text-[16px] font-semibold">
                    {property.bedrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    shower
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-[14px]">Bathrooms</p>
                  <p className="text-foreground text-[16px] font-semibold">
                    {property.bathrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    home
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-[14px]">Type</p>
                  <p className="text-foreground text-[16px] font-semibold capitalize">
                    {property.propertyType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    chair
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-[14px]">Furnished</p>
                  <p className="text-foreground text-[16px] font-semibold capitalize">
                    {property.furnishedStatus}
                  </p>
                </div>
              </div>
            </div>

            {property.description && (
              <div className="border-border mt-6 border-t pt-6">
                <h4 className="text-foreground mb-2 text-[16px] font-semibold">
                  Description
                </h4>
                <p className="text-muted-foreground text-[14px] leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="border-border mt-6 border-t pt-6">
                <h4 className="text-foreground mb-3 text-[16px] font-semibold">
                  Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-muted text-foreground rounded-full px-3 py-1 text-[14px]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 text-[21px] font-bold">
              Actions
            </h3>
            <div className="space-y-2">
              <Link
                href={`/properties/${property.id}/edit`}
                className="border-border text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                Edit Property
              </Link>
              <button className="border-border text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium">
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
                View Public Listing
              </button>
              <button className="border-destructive text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium">
                <span className="material-symbols-outlined text-[20px]">
                  delete
                </span>
                Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
