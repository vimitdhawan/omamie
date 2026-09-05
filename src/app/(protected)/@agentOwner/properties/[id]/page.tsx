import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getPropertyById } from "@/features/properties/repository";
import Link from "next/link";
import { MapPin, Edit2, Eye, Share2, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShowInterestButton } from "@/features/property-matches/components/show-interest-button";

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

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=400&fit=crop",
];

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property || property.profileId !== session.profileId) {
    redirect("/properties");
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="rounded-lg bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-[28px] font-bold">{property.title}</h1>
              <Badge variant="default">{getStatusLabel(property.status)}</Badge>
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <MapPin className="size-4" />
              {property.location}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[36px] font-bold text-blue-600">
              ${property.monthlyRent.toLocaleString()}
              <span className="text-[16px] font-normal text-gray-600">/mo</span>
            </div>
            <Link href={`/properties/${property.id}/edit`}>
              <Button size="sm" className="mt-2 gap-2">
                <Edit2 className="size-4" />
                Edit Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h3 className="mb-4 text-[20px] font-bold">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-muted-foreground text-sm">Bedrooms</p>
                <p className="mt-1 text-lg font-semibold">
                  {property.bedrooms} Bedrooms
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-muted-foreground text-sm">Bathrooms</p>
                <p className="mt-1 text-lg font-semibold">
                  {property.bathrooms} Bathrooms
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-muted-foreground text-sm">Type</p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {property.propertyType}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-muted-foreground text-sm">Furnished</p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {property.furnishedStatus}
                </p>
              </div>
            </div>
          </div>

          {property.description && (
            <div>
              <h3 className="mb-3 text-[20px] font-bold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {property.amenities.length > 0 && (
            <div>
              <h3 className="mb-3 text-[20px] font-bold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[20px] font-bold">Performance & Analytics</h3>
              <Link
                href="#"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View Detailed Report
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">Total Views</p>
                <p className="mt-2 text-2xl font-bold">1,248</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="size-3" />
                  +12% this week
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Viewing Requests
                </p>
                <p className="mt-2 text-2xl font-bold">24</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="size-3" />
                  +4 pending approval
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Inquiry Conversion
                </p>
                <p className="mt-2 text-2xl font-bold">8.4%</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Average market: 6.1%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-3 rounded-lg border p-6">
            <h3 className="mb-4 text-[20px] font-bold">Actions</h3>
            <Link href={`/properties/${property.id}/edit`} className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Edit2 className="size-4" />
                Edit Property
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Eye className="size-4" />
              View Public Listing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Share2 className="size-4" />
              Share Listing Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-2"
            >
              <Trash2 className="size-4" />
              Delete Property
            </Button>
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Photos</h3>
              <Link
                href="#"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Manage (6)
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PLACEHOLDER_PHOTOS.map((photo, idx) => (
                <div
                  key={idx}
                  className="bg-muted aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={photo}
                    alt={`Property ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <ShowInterestButton propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
