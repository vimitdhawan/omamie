import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { getProperty } from "@/features/properties/service";
import { PropertyEditClient } from "@/features/properties/components/property-edit-client";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect("/login");
  }

  const { id: propertyId } = await params;

  // Fetch the property by ID
  const property = await getProperty(propertyId);

  if (!property) {
    redirect("/list-property");
  }

  return <PropertyEditClient property={property} />;
}
