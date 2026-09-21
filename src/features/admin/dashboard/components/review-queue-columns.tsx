import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatRelativeDate } from "@/features/properties/utils/display";
import { ReviewRowActions } from "./review-row-actions";
import type { AdminPropertySummary } from "../../properties/types";

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  className?: string;
  cell: (context: {
    row: { original: AdminPropertySummary; index: number };
  }) => React.ReactNode;
}

export const reviewQueueColumns: Column[] = [
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
    id: "createdAt",
    header: "Submitted",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        {formatRelativeDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => <ReviewRowActions property={row.original} />,
  },
];
