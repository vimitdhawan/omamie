import { getCurrentUser } from "@/features/auth/service";
import { getMyPropertiesAction } from "@/features/properties/actions";
import {
  formatCurrency,
  getStatusColor,
  getStatusLabel,
} from "@/features/properties/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default async function PropertiesPage() {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect("/login");
  }

  const { data: properties, error } = await getMyPropertiesAction();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            List Property
          </Button>
        </Link>
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-6 rounded-lg border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {properties && properties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/properties/${property.id}`}
              className="block"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-medium">{property.title}</h3>
                    <Badge className={getStatusColor(property.status)}>
                      {getStatusLabel(property.status)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                    {property.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(property.rent_amount, property.currency)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {property.bedrooms}BR / {property.bathrooms}BA
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
                    <span>{getPropertyTypeLabel(property.property_type)}</span>
                    <span>·</span>
                    <span>{getFurnishingLabel(property.furnishing)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium">No properties yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by listing your first property
            </p>
            <Link href="/dashboard/properties/new">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                List Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    condo: "Condo",
    house: "House",
    townhouse: "Townhouse",
  };
  return labels[type] || type;
}

function getFurnishingLabel(furnishing: string): string {
  const labels: Record<string, string> = {
    fully: "Fully Furnished",
    partial: "Partially Furnished",
    none: "Unfurnished",
  };
  return labels[furnishing] || furnishing;
}
