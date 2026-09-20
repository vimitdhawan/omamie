import React from "react";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES } from "@/features/auth/schema";
import type { AdminUserSummary } from "../types";

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: AdminUserSummary; index: number };
  }) => React.ReactNode;
}

export const adminUserColumns: Column[] = [
  {
    id: "fullName",
    header: "User",
    enableSorting: true,
    cell: ({ row }) => (
      <p className="text-sm font-medium">{row.original.fullName ?? "—"}</p>
    ),
  },
  {
    id: "role",
    header: "Role",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant="secondary">{USER_ROLES[row.original.role]}</Badge>
    ),
  },
  {
    id: "email",
    header: "Email",
    enableSorting: true,
    cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
  },
  {
    id: "propertyCount",
    header: "Properties",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">{row.original.propertyCount}</div>
    ),
  },
  {
    id: "createdAt",
    header: "Joined",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
];
