import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Property } from "../types";

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  pending: "secondary",
  review: "secondary",
  rented: "outline",
  inactive: "outline",
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Published",
    pending: "Draft",
    review: "Review",
    rented: "Rented",
    inactive: "Inactive",
  };
  return labels[status] || status;
}

function derivePropertyCode(id: string): string {
  return `PROP-${id.slice(-4).toUpperCase()}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: Property; index: number };
  }) => React.ReactNode;
}

function PropertyActionsCell({ property }: { property: Property }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="hover:bg-muted rounded p-2 transition-colors">
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/properties/${property.id}/edit`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/properties/${property.id}`)}
        >
          View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
          className="hover:underline"
        >
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded">
              <div className="text-muted-foreground text-sm">📷</div>
            </div>
            <div>
              <p className="text-sm font-semibold">{property.title}</p>
              <p className="text-muted-foreground text-xs">
                {derivePropertyCode(property.id)}
              </p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    id: "location",
    header: "Location",
    enableSorting: true,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <div className="flex items-center gap-1 text-sm">
        <MapPin className="text-muted-foreground size-4" />
        {row.original.location}
      </div>
    ),
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
        ₹{row.original.monthlyRent.toLocaleString()}
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
      return formatDate(property.updatedAt || property.createdAt);
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }: { row: { original: Property; index: number } }) => (
      <PropertyActionsCell property={row.original} />
    ),
  },
];
