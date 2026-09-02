import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { PROPERTY_TYPES } from "../schema";
import type { Property } from "../types";

interface SuccessMessageProps {
  property: Property;
}

export function SuccessMessage({ property }: SuccessMessageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <div className="flex flex-grow items-center justify-center px-4 pt-24 pb-12">
        <div className="relative w-full max-w-xl">
          {/* Back to Home Link */}
          <div className="absolute top-0 left-0">
            <Link
              href="/"
              className="group text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] leading-none transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              Back to Home
            </Link>
          </div>

          <div className="relative mt-16 text-center">
            {/* Atmospheric Background */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
              <div className="bg-surface-container/40 h-[400px] w-[400px] animate-pulse rounded-full" />
            </div>

            {/* Success Icon */}
            <div className="mb-8 flex items-center justify-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                <span className="material-symbols-outlined text-[40px] font-semibold">
                  check_circle
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-12 text-center">
              {property.status === "pending" ? (
                <>
                  <h1 className="text-on-background mb-4 text-3xl font-bold">
                    Property Created Successfully! 🎉
                  </h1>
                  <p className="text-on-surface-variant mx-auto max-w-lg">
                    Your property has been created and submitted for review. Our
                    team will review your listing and activate it shortly.
                    We&apos;ll notify you when it&apos;s live.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-on-background mb-4 text-3xl font-bold">
                    Property Updated Successfully! ✓
                  </h1>
                  <p className="text-on-surface-variant mx-auto max-w-lg">
                    Your property details have been updated and submitted for
                    review. We&apos;ll notify you once the changes are approved.
                  </p>
                </>
              )}
            </div>

            {/* Summary Card */}
            <div className="border-outline-variant bg-surface-container-low mb-12 rounded-lg border p-6 text-left shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                <span className="text-primary text-xs font-bold tracking-wider uppercase">
                  Listing Published
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                {/* Property Details */}
                <div className="flex-grow">
                  <div className="mb-2">
                    <span className="bg-surface-container-high text-primary inline-block rounded-full px-3 py-1 text-xs font-semibold">
                      {
                        PROPERTY_TYPES[
                          property.propertyType as keyof typeof PROPERTY_TYPES
                        ]
                      }
                    </span>
                    <h3 className="text-on-surface mt-2 text-lg font-semibold">
                      {property.title}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    <div className="text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">
                        location_on
                      </span>
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="text-on-surface flex items-center gap-2 font-semibold">
                      <span className="material-symbols-outlined text-[18px]">
                        payments
                      </span>
                      <span className="text-sm">
                        {formatCurrency(property.monthlyRent, "en-US", "THB")}{" "}
                        <span className="text-on-surface-variant font-normal">
                          / month
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/properties"
                className="border-primary text-primary hover:bg-primary/5 inline-flex h-12 items-center justify-center rounded-full border px-6 font-semibold transition-all"
              >
                View All Properties
              </Link>
              <button
                disabled
                className="border-outline-variant bg-surface-container-high text-on-surface-variant inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full border px-6 font-semibold"
              >
                Dashboard Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
