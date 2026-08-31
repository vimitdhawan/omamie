import { getAuthSession } from "@/lib/auth-session";
import { getPropertiesByProfileId } from "@/features/properties/repository";
import { PropertiesView } from "@/features/dashboard/components/properties-view";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Properties",
  description: "Manage your property listings",
};

export default async function PropertiesPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const properties = await getPropertiesByProfileId(session.profileId);

  return <PropertiesView properties={properties} />;
}
