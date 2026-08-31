import { getAuthSession } from "@/lib/auth-session";
import { BasicDetailsForm } from "@/features/properties/components/basic-info-form";
import type { Property } from "@/features/properties/types";
import { PropertyNextAction } from "@/features/properties/types";
import { redirect } from "next/navigation";

export default async function CreatePropertyPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const now = new Date().toISOString();
  const newProperty: Property = {
    id: "",
    profileId: session.profileId,
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
    <main className="bg-background flex-1 px-4 py-8 pb-12">
      <BasicDetailsForm property={newProperty} />
    </main>
  );
}
