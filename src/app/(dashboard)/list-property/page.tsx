import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/service";
import { BasicDetailsForm } from "@/features/properties/components/basic-info-form";
import type { Property } from "@/features/properties/types";
import { PropertyNextAction } from "@/features/properties/types";

export default async function CreatePropertyPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect("/login");
  }

  const now = new Date().toISOString();
  const newProperty: Property = {
    id: "",
    profileId: profile.id,
    title: "",
    location: "",
    monthlyRent: 0,
    propertyType: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    description: null,
    furnishedStatus: "unfurnished",
    amenities: [],
    status: "pending",
    nextAction: PropertyNextAction.BASIC_DETAILS,
    createdAt: now,
  };

  return (
    <main className="min-h-screen bg-white px-4 pt-8 pb-12">
      <BasicDetailsForm property={newProperty} />
    </main>
  );
}
