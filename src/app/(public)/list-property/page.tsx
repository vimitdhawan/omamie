import { getCurrentUser } from "@/features/auth/service";
import { PublicPropertyFormWizard } from "@/features/properties/components/public-property-form-wizard";
import Header from "@/features/landing/components/Header";

export default async function PublicListPropertyPage() {
  const { user, profile } = await getCurrentUser();
  const isAuthenticated = !!user && !!profile;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[720px] px-[var(--sp-base)] pt-20 pb-[var(--sp-section)]">
        <PublicPropertyFormWizard
          isAuthenticated={isAuthenticated}
          isOwnerOrAgent={isAuthenticated && profile?.role !== "tenant"}
        />
      </main>
    </>
  );
}
