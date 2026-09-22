import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/features/properties/utils/display";
import type { AdminMatchSummary } from "../types";
import type { MatchStatus } from "@/features/property-matches/types";

const STATUS_BADGE_VARIANT: Record<
  MatchStatus,
  "default" | "secondary" | "destructive"
> = {
  interested: "secondary",
  approved: "default",
  rejected: "destructive",
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  interested: "Interested",
  approved: "Approved",
  rejected: "Rejected",
};

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: AdminMatchSummary; index: number };
  }) => React.ReactNode;
}

export const adminMatchColumns: Column[] = [
  {
    id: "propertyTitle",
    header: "Property",
    enableSorting: true,
    cell: ({ row }) => (
      <p className="text-sm font-medium">{row.original.propertyTitle}</p>
    ),
  },
  {
    id: "propertyLocation",
    header: "Location",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">{row.original.propertyLocation ?? "—"}</div>
    ),
  },
  {
    id: "tenantName",
    header: "Tenant",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">{row.original.tenantName ?? "Unknown"}</div>
    ),
  },
  {
    id: "createdAt",
    header: "Requested",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        {formatRelativeDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>
        {STATUS_LABEL[row.original.status]}
      </Badge>
    ),
  },
];
