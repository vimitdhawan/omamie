import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronRight,
  Layers,
  MapPin,
  Maximize2,
  Sofa,
} from "lucide-react";
import { getProperty } from "@/features/properties/service";
import { formatCurrency } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/features/properties/components/property-gallery";
import { PropertyDetailActions } from "@/features/properties/components/property-detail-actions";
import {
  AMENITIES,
  FURNISHED_STATUS,
  PROPERTY_TYPES,
} from "@/features/properties/schema";
import {
  BUILDING_FACILITY_VALUES,
  UNIT_AMENITY_VALUES,
} from "@/features/properties/types";
import {
  derivePropertyCode,
  formatRelativeDate,
  getStatusDotClass,
  getStatusLabel,
} from "@/features/properties/utils/display";
import type { Amenity, Property } from "@/features/properties/types";

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
  const property = await getProperty(id);

  if (!property || property.profileId !== session.profileId) {
    redirect("/properties");
  }

  const selected = new Set<Amenity>(property.amenities);
  const buildingFacilities = BUILDING_FACILITY_VALUES.filter((value) =>
    selected.has(value)
  );
  const unitAmenities = UNIT_AMENITY_VALUES.filter((value) =>
    selected.has(value)
  );

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <nav className="text-muted-foreground flex items-center gap-1 text-sm">
        <Link href="/properties" className="hover:text-foreground">
          Properties
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">
          {derivePropertyCode(property.id)}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Listing */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">
                {property.title}
              </h1>
              <span className="bg-surface-soft text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <span
                  className={`size-2 rounded-full ${getStatusDotClass(property.status)}`}
                  aria-hidden
                />
                {getStatusLabel(property.status)}
              </span>
            </div>

            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 shrink-0" />
              {property.location || "Location not set"}
            </p>

            {property.condo?.name && (
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                <Building2 className="size-4 shrink-0" />
                {property.condo.name}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <PropertyGallery images={property.images} title={property.title} />
          </Card>

          <Card className="p-5">
            <h2 className="text-foreground mb-4 text-lg font-bold">
              Key specifications
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
                icon={<Sofa className="size-5" />}
                label="Furnishing"
                value={
                  property.furnishedStatus
                    ? FURNISHED_STATUS[property.furnishedStatus]
                    : "—"
                }
              />
              <SpecTile
                icon={<Layers className="size-5" />}
                label="Floor"
                value={formatFloor(property)}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-foreground text-lg font-bold">
                About this listing
              </h2>
              <p className="text-muted-foreground text-xs">
                Last updated{" "}
                {formatRelativeDate(property.updatedAt || property.createdAt)}
              </p>
            </div>
            {property.description ? (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            ) : (
              <EmptyNote>
                No description yet. Add one so tenants know what makes this
                place worth a viewing.
              </EmptyNote>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-foreground mb-4 text-lg font-bold">
              Amenities &amp; facility access
            </h2>
            {buildingFacilities.length === 0 && unitAmenities.length === 0 ? (
              <EmptyNote>
                Nothing listed yet — a plain house may genuinely have none.
              </EmptyNote>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AmenityGroup
                  title="In the unit"
                  amenities={unitAmenities}
                  emptyNote="Nothing listed for the unit."
                />
                <AmenityGroup
                  title="Building facilities"
                  amenities={buildingFacilities}
                  emptyNote="Nothing listed for the building."
                />
              </div>
            )}
          </Card>
        </div>

        {/* Owner controls */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-5">
            <h2 className="text-uppercase-tag text-muted-foreground tracking-wider uppercase">
              Financial overview
            </h2>
            <div className="mt-3">
              <p className="text-muted-foreground text-xs font-semibold">
                MONTHLY RENT
              </p>
              <p className="text-foreground text-3xl font-bold">
                {property.monthlyRent
                  ? formatCurrency(property.monthlyRent, "en-US", "THB")
                  : "Not set"}
                {property.monthlyRent != null && (
                  <span className="text-muted-foreground ml-1 text-sm font-normal">
                    / month
                  </span>
                )}
              </p>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <SummaryRow
                label="Security deposit"
                value={
                  property.securityDepositMonths != null
                    ? `${property.securityDepositMonths} ${plural(property.securityDepositMonths, "month")} rent`
                    : null
                }
              />
              <SummaryRow
                label="Minimum lease"
                value={
                  property.minimumLeaseMonths != null
                    ? `${property.minimumLeaseMonths} ${plural(property.minimumLeaseMonths, "month")}`
                    : null
                }
              />
              <SummaryRow
                label="Available from"
                value={
                  property.availableFrom ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatAvailableFrom(property.availableFrom)}
                    </span>
                  ) : null
                }
              />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-uppercase-tag text-muted-foreground mb-3 tracking-wider uppercase">
              Host operations
            </h2>
            <PropertyDetailActions property={property} />
          </Card>

          <Card className="p-5">
            <h2 className="text-uppercase-tag text-muted-foreground tracking-wider uppercase">
              Property summary
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <SummaryRow
                label="Property ID"
                value={derivePropertyCode(property.id)}
              />
              <SummaryRow
                label="Type"
                value={
                  property.propertyType
                    ? PROPERTY_TYPES[property.propertyType]
                    : null
                }
              />
              <SummaryRow label="Building" value={property.condo?.name} />
              <SummaryRow
                label="Configuration"
                value={`${property.bedrooms} bed, ${property.bathrooms} bath${
                  property.areaSqm ? ` (${property.areaSqm} m²)` : ""
                }`}
              />
              <SummaryRow label="Floor" value={formatFloor(property)} />
              <SummaryRow
                label="Photos"
                value={`${property.images.length} of 10`}
              />
            </dl>
          </Card>
        </div>
      </div>
    </div>
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
  value: React.ReactNode | null | undefined;
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
  emptyNote,
}: {
  title: string;
  amenities: readonly Amenity[];
  emptyNote: string;
}) {
  return (
    <div>
      <h3 className="text-micro-label text-muted-foreground mb-2 tracking-wider uppercase">
        {title}
      </h3>
      {amenities.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyNote}</p>
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

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}

function plural(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function formatFloor(property: Property): string {
  if (property.floorNumber == null) return "—";
  return property.totalFloors
    ? `${property.floorNumber} of ${property.totalFloors}`
    : String(property.floorNumber);
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
