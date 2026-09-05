import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { MatchActions } from "./match-actions";
import type { PropertyMatchWithProperty } from "../types";

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

interface MatchesTableProps {
  matches: PropertyMatchWithProperty[];
  _onStatusChange?: (matchId: string, status: string) => void;
}

export function MatchesTable({ matches }: MatchesTableProps) {
  if (matches.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border">
        <div className="text-muted-foreground text-center">
          <p>No matches found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Monthly Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id} className="hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/matches/${match.id}`}
                  className="text-foreground font-semibold hover:underline"
                >
                  {match.property.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <MapPin className="size-4" />
                  {match.property.location}
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                ₹{match.property.monthlyRent.toLocaleString()}/mo
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_BADGE_VARIANT[match.status] || "default"}
                >
                  {getStatusLabel(match.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(match.createdAt)}
              </TableCell>
              <TableCell>
                <MatchActions matchId={match.id} currentStatus={match.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
