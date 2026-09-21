import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getStatusLabel,
  getStatusDotClass,
} from "@/features/properties/utils/display";
import type { AdminPropertySummary } from "../types";

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: AdminPropertySummary; index: number };
  }) => React.ReactNode;
}

export const adminPropertyColumns: Column[] = [
  {
    id: "property",
    header: "Property",
    enableSorting: false,
    cell: ({ row }) => {
      const property = row.original;
      return (
        <Link
          href={`/properties/${property.id}`}
          className="block max-w-[260px] hover:underline"
        >
          <p className="truncate text-sm font-semibold">{property.title}</p>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{property.location || "—"}</span>
          </p>
        </Link>
      );
    },
  },
  {
    id: "ownerName",
    header: "Owner",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        <p>{row.original.ownerName ?? "Unknown"}</p>
        {row.original.ownerEmail && (
          <p className="text-muted-foreground text-xs">
            {row.original.ownerEmail}
          </p>
        )}
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">{row.original.location ?? "—"}</div>
    ),
  },
  {
    id: "monthlyRent",
    header: "Price",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.monthlyRent != null
          ? `฿${row.original.monthlyRent.toLocaleString()}/mo`
          : "—"}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant="outline" className="gap-1.5">
        <span
          className={`size-1.5 rounded-full ${getStatusDotClass(row.original.status)}`}
        />
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
];
