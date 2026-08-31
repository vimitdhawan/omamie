"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ViewingRequestWithProperty } from "../types";
import { ViewingRequestActions } from "./ViewingRequestActions";

interface ViewingRequestsTableProps {
  requests: ViewingRequestWithProperty[];
  onStatusChange?: () => void;
}

/**
 * Get badge variant for status
 */
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "pending":
      return "default";
    case "accepted":
      return "secondary";
    case "completed":
      return "outline";
    case "declined":
      return "destructive";
    case "cancelled":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Format date to international format (15 Sep 2026)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format time to 24-hour format (14:00)
 */
function formatTime(timeString: string): string {
  return timeString.slice(0, 5); // HH:MM
}

/**
 * Table component for viewing requests
 */
export function ViewingRequestsTable({
  requests,
  onStatusChange,
}: ViewingRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-outlined text-muted-foreground mb-4 text-5xl">
          inbox
        </span>
        <h3 className="mb-1 text-lg font-semibold">No viewing requests</h3>
        <p className="text-muted-foreground text-sm">
          Viewing requests will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <Link
                  href={`/viewing-requests/${request.id}`}
                  className="font-medium hover:underline"
                >
                  {request.property.title}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {request.property.location}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{request.requesterName}</div>
                <div className="text-muted-foreground text-xs">
                  {request.requesterEmail}
                </div>
              </TableCell>
              <TableCell>{formatDate(request.requestedDate)}</TableCell>
              <TableCell>
                {formatTime(request.requestedTimeStart)} -{" "}
                {formatTime(request.requestedTimeEnd)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ViewingRequestActions
                  requestId={request.id}
                  currentStatus={request.status}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
