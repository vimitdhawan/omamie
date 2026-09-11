import { getAuthSession } from "@/lib/auth-session";
import { getPropertyById } from "@/features/properties/repository";
import { PropertyEditClient } from "@/features/properties/components/property-edit-client";
import { redirect } from "next/navigation";

export default async function EditPropertyPage({
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
    <main className="bg-background flex-1 px-4 py-8 pb-12">
      <PropertyEditClient property={property} />
    </main>
  );
}
