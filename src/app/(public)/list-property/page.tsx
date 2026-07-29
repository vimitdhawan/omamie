import { PublicPropertyFormWizard } from "@/features/properties/components/public-property-form-wizard";
import Header from "@/features/landing/components/Header";
import Link from "next/link";

export default function PublicListPropertyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[720px] px-[var(--sp-base)] pt-16 pb-[var(--sp-section)]">
        <div className="mb-[var(--sp-xl)]">
          <Link
            href="/"
            className="text-primary font-title-md text-nav-link group inline-flex items-center gap-[var(--sp-xs)] hover:underline"
          >
            <span
              className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1"
              style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
            >
              chevron_left
            </span>
            Back
          </Link>
          <h1 className="text-display-xl text-ink font-bold">
            List Your Property
          </h1>
          <p className="text-muted font-body-md mt-[var(--sp-xxs)]">
            Tell us about your property to reach thousands of potential tenants.
          </p>
        </div>
        <PublicPropertyFormWizard />
      </main>
    </>
  );
}
