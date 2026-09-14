import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { MapPin, BedDouble, Bath, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/storage-url";
import { PropertyRowActions } from "./property-row-actions";
import {
  derivePropertyCode,
  formatRelativeDate,
  getStatusLabel,
} from "../utils/display";
import type { Property } from "../types";

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  draft: "secondary",
  pending: "secondary",
  review: "secondary",
  rented: "outline",
  inactive: "outline",
};

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: Property; index: number };
  }) => React.ReactNode;
}

export const propertyColumns: Column[] = [
  {
    id: "property",
    header: "Property",
    enableSorting: false,
    cell: ({ row }: { row: { original: Property; index: number } }) => {
      const property = row.original;
      return (
        <Link
          href={`/properties/${property.id}/edit`}
          className="block max-w-[260px] hover:underline"
        >
          <div className="flex items-center gap-3">
            <div className="bg-surface-soft relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
              {property.images[0] ? (
                <Image
                  src={getPublicImageUrl(property.images[0].storagePath)}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="text-muted-foreground size-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{property.title}</p>
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">
                  {property.location || derivePropertyCode(property.id)}
                </span>
              </p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    id: "propertyType",
    header: "Type",
    enableSorting: true,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <div className="text-sm">{(row.original as Property).propertyType}</div>
    ),
  },
  {
    id: "monthlyRent",
    header: "Rent / mo",
    enableSorting: true,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <div className="text-sm font-medium">
        {row.original.monthlyRent
          ? formatCurrency(row.original.monthlyRent, "en-US", "THB")
          : "—"}
      </div>
    ),
  },
  {
    id: "details",
    header: "Details",
    enableSorting: false,
    cell: ({ row }: { row: { original: Property; index: number } }) => {
      const property = row.original;
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <BedDouble className="text-muted-foreground size-4" />
            {property.bedrooms}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="text-muted-foreground size-4" />
            {property.bathrooms}
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <Badge
        variant={
          STATUS_BADGE_VARIANT[(row.original as Property).status] || "default"
        }
      >
        {getStatusLabel((row.original as Property).status)}
      </Badge>
    ),
  },
  {
    id: "updatedAt",
    header: "Updated",
    enableSorting: true,
    cell: ({ row }: { row: { original: Property; index: number } }) => {
      const property = row.original;
      return formatRelativeDate(property.updatedAt || property.createdAt);
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <PropertyRowActions property={row.original} />
    ),
  },
];
