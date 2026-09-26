import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { PropertyMatchWithProperty } from "../types";
import { MatchActions } from "./match-actions";
import { derivePropertyCode } from "@/features/properties/utils/display";

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  interested: "secondary",
  approved: "default",
  rejected: "destructive",
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    interested: "Interested",
    approved: "Approved",
    rejected: "Rejected",
  };
  return labels[status] || status;
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
    row: { original: PropertyMatchWithProperty; index: number };
  }) => React.ReactNode;
}

export const matchColumns: Column[] = [
  {
    id: "tenant",
    header: "Tenant",
    enableSorting: false,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <p className="text-sm font-semibold">
        {row.original.tenantFirstName || "Tenant"}
      </p>
    ),
  },
  {
    id: "property",
    header: "Property",
    enableSorting: false,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <div>
        <p className="text-sm font-semibold">{row.original.property.title}</p>
        <p className="text-muted-foreground font-mono text-xs">
          {derivePropertyCode(row.original.property.id)}
        </p>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    enableSorting: true,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <div className="text-muted-foreground flex items-center gap-1 text-sm">
        <MapPin className="size-4" />
        {row.original.property.location}
      </div>
    ),
  },
  {
    id: "monthlyRent",
    header: "Monthly Rent",
    enableSorting: true,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <div className="text-sm font-semibold">
        ₹{row.original.property.monthlyRent.toLocaleString()}/mo
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    enableSorting: true,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.original.status] || "default"}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Created",
    enableSorting: true,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <div className="text-muted-foreground text-sm">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({
      row,
    }: {
      row: { original: PropertyMatchWithProperty; index: number };
    }) => (
      <div onClick={(event) => event.stopPropagation()}>
        <MatchActions
          matchId={row.original.id}
          currentStatus={row.original.status}
          variant="menu"
        />
      </div>
    ),
  },
];
