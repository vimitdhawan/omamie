"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bed, Bath, MapPin } from "lucide-react";
import type { Property } from "../types";
import { PROPERTY_TYPES, FURNISHED_STATUS } from "../schema";

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  hasRequested?: boolean;
  onSaveToggle?: (propertyId: string) => void;
  onInterestClick?: (propertyId: string) => void;
}

export function PropertyCard({
  property,
  isSaved = false,
  hasRequested = false,
  onSaveToggle,
  onInterestClick,
}: PropertyCardProps) {
  const placeholderImage = `https://placehold.co/400x300/e2e8f0/475569?text=${encodeURIComponent(
    property.title
  )}`;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 sm:h-56">
        <img
          src={placeholderImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {PROPERTY_TYPES[property.propertyType]}
          </Badge>
        </div>

        {/* Save Button */}
        <button
          onClick={() => onSaveToggle?.(property.id)}
          className="absolute top-2 right-2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <h3 className="truncate font-semibold text-gray-900">
            {property.title}
          </h3>
          <div className="ml-2 shrink-0">
            <span className="font-semibold text-gray-900">
              ${property.monthlyRent.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">/mo</span>
          </div>
        </div>

        <p className="flex items-center gap-1 truncate text-sm text-gray-600">
          <MapPin className="h-4 w-4 shrink-0" />
          {property.location}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms} Bed{property.bedrooms !== 1 ? "s" : ""}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms} Bath{property.bathrooms !== 1 ? "s" : ""}
          </span>
          <span>•</span>
          <span className="text-xs">
            {FURNISHED_STATUS[property.furnishedStatus]}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-2 flex gap-2">
          <Link href={`/browse-properties/${property.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {hasRequested ? (
            <Button size="sm" className="flex-1" disabled>
              Requested
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onInterestClick?.(property.id)}
            >
              I&apos;m Interested
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
