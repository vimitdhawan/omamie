import { getAuthSession } from "@/lib/auth-session";
import { redirect, notFound } from "next/navigation";
import { Bath, BedDouble, CalendarDays, MapPin, Maximize2 } from "lucide-react";
import { getPublishedPropertyAction } from "@/features/properties/actions";
import { getMatchedPropertyIdsAction } from "@/features/property-matches/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/features/properties/components/property-detail/property-gallery";
import {
  AMENITIES,
  FURNISHED_STATUS,
  PROPERTY_TYPES,
} from "@/features/properties/schema";
import {
  BUILDING_FACILITY_VALUES,
  UNIT_AMENITY_VALUES,
} from "@/features/properties/types";
import type { Amenity } from "@/features/properties/types";
import { formatCurrency } from "@/lib/utils/format";
import { InterestButton } from "./interest-button";
import { CopyLinkButton } from "./copy-link-button";

export const dynamic = "force-dynamic";

export default async function ExplorePropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const { id } = await params;
  const property = await getPublishedPropertyAction(id);

  if (!property) {
    notFound();
  }

  const matchedPropertyIds = await getMatchedPropertyIdsAction();
  const isInterested = matchedPropertyIds.includes(property.id);

  const selected = new Set<Amenity>(property.amenities);
  const buildingFacilities = BUILDING_FACILITY_VALUES.filter((value) =>
    selected.has(value)
  );
  const unitAmenities = UNIT_AMENITY_VALUES.filter((value) =>
    selected.has(value)
  );

  return (
    <main className="flex-1 space-y-6 bg-white p-6 lg:p-8">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Listing */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">
                {property.title}
              </h1>
              {property.propertyType && (
                <Badge variant="secondary">
                  {PROPERTY_TYPES[property.propertyType]}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 shrink-0" />
              {property.location || "Location not set"}
            </p>
          </Card>

          <Card className="p-5">
            <PropertyGallery images={property.images} title={property.title} />
          </Card>

          <Card className="p-5">
            <h2 className="text-foreground mb-4 text-lg font-bold">
              Key specifications
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <SpecTile
                icon={<BedDouble className="size-5" />}
                label="Bedrooms"
                value={String(property.bedrooms)}
              />
              <SpecTile
                icon={<Bath className="size-5" />}
                label="Bathrooms"
                value={String(property.bathrooms)}
              />
              <SpecTile
                icon={<Maximize2 className="size-5" />}
                label="Floor area"
                value={property.areaSqm ? `${property.areaSqm} m²` : "—"}
              />
              <SpecTile
                icon={<CalendarDays className="size-5" />}
                label="Available from"
                value={
                  property.availableFrom
                    ? formatAvailableFrom(property.availableFrom)
                    : "—"
                }
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-foreground mb-3 text-lg font-bold">
              About this listing
            </h2>
            {property.description ? (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No description provided.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-foreground mb-4 text-lg font-bold">
              Amenities &amp; facilities
            </h2>
            {buildingFacilities.length === 0 && unitAmenities.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No amenities listed.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AmenityGroup title="In the unit" amenities={unitAmenities} />
                <AmenityGroup
                  title="Building facilities"
                  amenities={buildingFacilities}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Actions & summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-5">
            <p className="text-muted-foreground text-xs font-semibold">
              MONTHLY RENT
            </p>
            <p className="text-foreground text-3xl font-bold">
              {property.monthlyRent != null
                ? formatCurrency(property.monthlyRent, "en-US", "THB")
                : "Price on request"}
              {property.monthlyRent != null && (
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  / month
                </span>
              )}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <SummaryRow
                label="Security deposit"
                value={
                  property.securityDepositMonths != null
                    ? `${property.securityDepositMonths} month(s) rent`
                    : null
                }
              />
              <SummaryRow
                label="Minimum lease"
                value={
                  property.minimumLeaseMonths != null
                    ? `${property.minimumLeaseMonths} month(s)`
                    : null
                }
              />
              <SummaryRow
                label="Furnishing"
                value={
                  property.furnishedStatus
                    ? FURNISHED_STATUS[property.furnishedStatus]
                    : null
                }
              />
            </dl>
          </Card>

          <Card className="space-y-2 p-5">
            <InterestButton
              propertyId={property.id}
              initialInterested={isInterested}
            />
            <CopyLinkButton />
          </Card>
        </div>
      </div>
    </main>
  );
}

function SpecTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-hairline-soft rounded-lg border p-3">
      <div className="text-primary">{icon}</div>
      <p className="text-foreground mt-2 text-sm font-semibold">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-foreground text-right font-medium">
        {value ?? <span className="text-muted-foreground">Not set</span>}
      </dd>
    </div>
  );
}

function AmenityGroup({
  title,
  amenities,
}: {
  title: string;
  amenities: readonly Amenity[];
}) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      {amenities.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing listed.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary">
              {AMENITIES[amenity]}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/** `availableFrom` is a plain "YYYY-MM-DD"; parsing it as a Date would shift the day. */
function formatAvailableFrom(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
