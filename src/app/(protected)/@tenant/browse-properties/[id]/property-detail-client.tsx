"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ViewingRequestDialog } from "@/features/viewing-requests/components/viewing-request-dialog";
import { toggleSavePropertyAction } from "@/features/saved-properties/actions";
import { Heart, MapPin, Bed, Bath, ArrowLeft, Check } from "lucide-react";
import type { PropertyWithMeta } from "@/features/properties/types";
import {
  PROPERTY_TYPES,
  FURNISHED_STATUS,
  AMENITIES,
} from "@/features/properties/schema";
import { toast } from "sonner";

interface PropertyDetailClientProps {
  property: PropertyWithMeta;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const [hasRequested, setHasRequested] = useState(
    property.hasRequested || false
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const placeholderImage = `https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(property.title)}`;

  const handleSaveToggle = async () => {
    const result = await toggleSavePropertyAction(property.id);
    if (result.success) {
      setIsSaved(result.data.isSaved);
      toast.success(result.data.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleRequestSuccess = () => {
    setHasRequested(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        {/* Back Button */}
        <Link
          href="/browse-properties"
          className="text-primary mb-6 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        {/* Property Image */}
        <div className="mb-6 overflow-hidden rounded-xl">
          <img
            src={placeholderImage}
            alt={property.title}
            className="h-96 w-full object-cover"
          />
        </div>

        {/* Property Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <Badge>{PROPERTY_TYPES[property.propertyType]}</Badge>
            </div>
            <p className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-5 w-5" />
              {property.location}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              ${property.monthlyRent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-3">
          {hasRequested ? (
            <Button size="lg" disabled className="flex-1">
              Request Sent
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="flex-1"
            >
              Request Viewing
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleSaveToggle}
            className="gap-2"
          >
            <Heart
              className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
            />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>

        {/* Property Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Property Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5 text-gray-400" />
                <span>
                  {property.bedrooms} Bedroom
                  {property.bedrooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-5 w-5 text-gray-400" />
                <span>
                  {property.bathrooms} Bathroom
                  {property.bathrooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-gray-400" />
                <span>{FURNISHED_STATUS[property.furnishedStatus]}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.length > 0 ? (
                property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{AMENITIES[amenity]}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No amenities listed</p>
              )}
            </div>
          </Card>
        </div>

        {/* Description */}
        {property.description && (
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Description</h2>
            <p className="whitespace-pre-line text-gray-700">
              {property.description}
            </p>
          </Card>
        )}
      </div>

      {/* Viewing Request Dialog */}
      <ViewingRequestDialog
        propertyId={property.id}
        propertyTitle={property.title}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}
