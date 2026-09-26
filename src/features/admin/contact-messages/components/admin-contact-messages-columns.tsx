import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/features/properties/utils/display";
import { CONTACT_SUBJECT_OPTIONS } from "@/features/contact/schema";
import type { AdminContactMessage, ContactMessageStatus } from "../types";

const SUBJECT_LABEL: Record<string, string> = Object.fromEntries(
  CONTACT_SUBJECT_OPTIONS.map((option) => [option.value, option.label])
);

const STATUS_BADGE_VARIANT: Record<
  ContactMessageStatus,
  "default" | "secondary"
> = {
  open: "secondary",
  completed: "default",
};

const STATUS_LABEL: Record<ContactMessageStatus, string> = {
  open: "Open",
  completed: "Completed",
};

interface Column {
  id: string;
  header: string;
  enableSorting: boolean;
  cell: (context: {
    row: { original: AdminContactMessage; index: number };
  }) => React.ReactNode;
}

export const adminContactMessageColumns: Column[] = [
  {
    id: "fullName",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => (
      <p className="text-sm font-medium">{row.original.fullName}</p>
    ),
  },
  {
    id: "email",
    header: "Email",
    enableSorting: true,
    cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
  },
  {
    id: "subject",
    header: "Subject",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="text-sm">
        {SUBJECT_LABEL[row.original.subject] ?? row.original.subject}
      </div>
    ),
  },
  {
    id: "createdAt",
    header: "Received",
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
