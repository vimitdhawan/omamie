import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { getPropertyById } from "@/features/properties/repository";
import { formatCurrency } from "@/lib/utils/format";
import {
  PROPERTY_TYPES,
  FURNISHED_STATUS,
  AMENITIES,
  PROPERTY_STATUSES,
} from "@/features/properties/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "rented":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "review":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export const metadata = {
  title: "Property Details",
  description: "View your property details",
};

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const property = await getPropertyById(params.id);
  if (!property) {
    notFound();
  }

  if (property.profileId !== session.profileId) {
    notFound();
  }

  const createdDate = new Date(property.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const updatedDate = property.updatedAt
    ? new Date(property.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl p-6">
        <Link
          href="/properties"
          className="text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Properties
        </Link>

        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">{property.title}</h1>
          <p className="text-muted-foreground">{property.location}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Image Placeholder */}
            <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
              <p className="text-muted-foreground">Property Image</p>
            </div>

            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Property Type
                    </p>
                    <p className="font-medium">
                      {PROPERTY_TYPES[
                        property.propertyType as keyof typeof PROPERTY_TYPES
                      ] || property.propertyType}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Monthly Rent
                    </p>
                    <p className="font-medium">
                      {formatCurrency(property.monthlyRent, "en-US", "THB")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Furnished Status */}
            <Card>
              <CardHeader>
                <CardTitle>Furnishing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {FURNISHED_STATUS[
                    property.furnishedStatus as keyof typeof FURNISHED_STATUS
                  ] || property.furnishedStatus}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {AMENITIES[amenity as keyof typeof AMENITIES] ||
                          amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge
                  className={`w-full justify-center py-2 text-center ${getStatusBadgeColor(property.status)}`}
                >
                  {PROPERTY_STATUSES[
                    property.status as keyof typeof PROPERTY_STATUSES
                  ] || property.status}
                </Badge>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{createdDate}</p>
                  </div>
                  {updatedDate && (
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{updatedDate}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/list-property/${property.id}`}
                  className="block w-full"
                >
                  <Button className="w-full">Edit Property</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
