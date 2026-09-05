"use client";

import { useRouter } from "next/navigation";
import { BedDouble, Bath, MapPin, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface PropertiesGridProps {
  properties: Property[];
}

export function PropertiesGrid({ properties }: PropertiesGridProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {properties.map((property) => (
        <Card
          key={property.id}
          className="group bg-primary/10 hover:bg-primary/20 cursor-pointer overflow-hidden transition-all hover:shadow-md"
          onClick={() => router.push(`/properties/${property.id}/edit`)}
        >
          {/* Image area */}
          <div className="bg-muted relative flex h-48 items-center justify-center overflow-hidden">
            <div className="text-muted-foreground text-6xl">📷</div>

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={STATUS_BADGE_VARIANT[property.status] || "default"}
              >
                {getStatusLabel(property.status)}
              </Badge>
            </div>

            {/* Action menu */}
            <div
              className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-background/80 hover:bg-background rounded-full p-2">
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/properties/${property.id}/edit`)
                    }
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
            </div>
          </div>

          {/* Content */}
          <div className="pointer-events-none space-y-3 p-4">
            {/* Title and location */}
            <div>
              <p className="text-foreground font-semibold">{property.title}</p>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <MapPin className="size-4" />
                {property.location}
              </div>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <BedDouble className="text-muted-foreground size-4" />
                {property.bedrooms}
              </div>
              <div className="flex items-center gap-1">
                <Bath className="text-muted-foreground size-4" />
                {property.bathrooms}
              </div>
            </div>

            {/* Rent */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {property.propertyType}
              </p>
              <p className="text-foreground font-semibold">
                ₹{property.monthlyRent.toLocaleString()}/mo
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
