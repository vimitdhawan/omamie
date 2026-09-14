"use client";

import Link from "next/link";
import Image from "next/image";
import { Bath, BedDouble, ImageIcon, MapPin, Maximize2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { getPublicImageUrl } from "@/lib/storage-url";
import { PropertyRowActions } from "./property-row-actions";
import { PROPERTY_TYPES } from "../schema";
import {
  derivePropertyCode,
  formatRelativeDate,
  getStatusDotClass,
  getStatusLabel,
} from "../utils/display";
import type { Property } from "../types";

interface PropertiesGridProps {
  properties: Property[];
}

export function PropertiesGrid({ properties }: PropertiesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];
  const typeLabel = property.propertyType
    ? PROPERTY_TYPES[property.propertyType]
    : null;

  return (
    <Card className="group bg-card overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="bg-surface-soft relative aspect-[4/3] w-full overflow-hidden">
        {cover ? (
          <Image
            src={getPublicImageUrl(cover.storagePath)}
            alt={property.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="text-muted-foreground size-10" />
          </div>
        )}

        {/* Both pills float on the photo, so they carry their own opaque backing. */}
        <span className="bg-background/90 text-foreground absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
          <span
            className={`size-2 rounded-full ${getStatusDotClass(property.status)}`}
            aria-hidden
          />
          {getStatusLabel(property.status)}
        </span>

        {typeLabel && (
          <span className="bg-background/90 text-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
            {typeLabel}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Title and price share a baseline; the price must never be pushed out of view, so
            only the title shrinks. */}
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={`/properties/${property.id}/edit`}
            className="min-w-0 flex-1 hover:underline"
          >
            <h3 className="text-foreground truncate text-base font-bold">
              {property.title}
            </h3>
          </Link>
          <p className="text-foreground shrink-0 text-base font-bold">
            {property.monthlyRent
              ? formatCurrency(property.monthlyRent, "en-US", "THB")
              : "—"}
          </p>
        </div>

        <div className="mt-0.5 flex items-baseline justify-between gap-3">
          <p className="text-muted-foreground truncate text-sm">
            {derivePropertyCode(property.id)}
          </p>
          {property.monthlyRent != null && (
            <p className="text-muted-foreground shrink-0 text-sm">/ mo</p>
          )}
        </div>

        <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-sm">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">
            {property.location || "Location not set"}
          </span>
        </p>

        <div className="border-hairline-soft text-foreground mt-3 flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-1.5">
            <BedDouble className="text-muted-foreground size-4" />
            {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="text-muted-foreground size-4" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="text-muted-foreground size-4" />
            {property.areaSqm ? `${property.areaSqm} m²` : "— m²"}
          </span>
        </div>

        <div className="border-hairline-soft mt-3 flex items-center justify-between border-t pt-3">
          <p className="text-muted-foreground text-sm">
            Updated{" "}
            {formatRelativeDate(property.updatedAt || property.createdAt)}
          </p>
          <PropertyRowActions property={property} />
        </div>
      </div>
    </Card>
  );
}
