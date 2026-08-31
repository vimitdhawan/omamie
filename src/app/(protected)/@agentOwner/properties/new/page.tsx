import { getAuthSession } from "@/lib/auth-session";
import { BasicDetailsForm } from "@/features/properties/components/basic-info-form";
import type { Property } from "@/features/properties/types";
import { PropertyNextAction } from "@/features/properties/types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Add Property",
  description: "List a new property",
};

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
    <div className="mx-auto max-w-2xl p-6">
      <BasicDetailsForm property={newProperty} />
    </div>
  );
}
