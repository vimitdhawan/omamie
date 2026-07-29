import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/features/landing/components/Header";

export default function ListingSuccessPage() {
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
        </div>

        <div className="mx-auto max-w-md text-center">
          <div className="mb-8">
            <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <span
                className="material-symbols-outlined text-[32px]"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 500' }}
              >
                check_circle
              </span>
            </div>
            <h1 className="text-ink mb-4 text-3xl font-bold">
              Your Property Has Been Listed!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Your property is now live. Our team will review your listing and
              reach out if we need more details.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" render={<Link href="/list-property" />}>
              List Another Property
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/" />}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
