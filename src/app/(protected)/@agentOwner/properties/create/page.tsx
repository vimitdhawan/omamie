import { getAuthSession } from "@/lib/auth-session";
import { PropertyForm } from "@/features/properties/components/property-form/property-form";
import { redirect } from "next/navigation";

export default async function CreatePropertyPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  return (
    <main className="bg-background mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">List a property</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in each section, then publish. You can save a draft at any point.
        </p>
      </header>
      <PropertyForm />
    </main>
  );
}
