import Link from "next/link";
import { BedDouble, Bath, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface PropertiesTableProps {
  properties: Property[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rent / mo</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow
              key={property.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="text-muted-foreground size-4" />
                  {property.location}
                </div>
              </TableCell>
              <TableCell className="text-sm">{property.propertyType}</TableCell>
              <TableCell className="text-sm font-medium">
                ₹{property.monthlyRent.toLocaleString()}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_BADGE_VARIANT[property.status] || "default"}
                >
                  {getStatusLabel(property.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(property.updatedAt || property.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
