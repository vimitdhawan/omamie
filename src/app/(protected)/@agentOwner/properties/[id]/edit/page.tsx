import { getAuthSession } from "@/lib/auth-session";
import { getProperty } from "@/features/properties/service";
import { PropertyForm } from "@/features/properties/components/property-form/property-form";
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
  const property = await getProperty(id);

  if (!property || property.profileId !== session.profileId) {
    redirect("/properties");
  }

  return (
    <main className="bg-background mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Edit listing</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Changes are saved in one submit. Publishing sends the listing for
          review.
        </p>
      </header>
      {/* Deliberately not keyed on updatedAt: a server action revalidates this route, so a
          changing key would remount PropertyForm and reset its useActionState before the
          result could be read — losing every toast and the post-publish redirect. The form
          re-syncs from this prop itself. */}
      <PropertyForm property={property} />
    </main>
  );
}
