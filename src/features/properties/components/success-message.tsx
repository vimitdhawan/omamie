import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { buttonVariants } from "@/components/ui/button";
import { PROPERTY_TYPES } from "../schema";
import type { Property } from "../types";
import { cn } from "@/lib/utils";

interface SuccessMessageProps {
  property: Property;
}

export function SuccessMessage({ property }: SuccessMessageProps) {
  return (
    <div className="mx-auto max-w-6xl pt-4">
      {/* Success Card */}
      <div className="bg-primary/5 rounded-lg p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Image Placeholder */}
          <div className="flex items-center justify-center">
            <div className="relative w-full">
              <div className="bg-muted aspect-square overflow-hidden rounded-lg shadow-sm">
                <div className="from-muted to-muted/50 flex h-full w-full items-center justify-center bg-gradient-to-br">
                  <div className="text-center">
                    <div className="mb-2 text-6xl">🏠</div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Property Image
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Success Message & Details */}
          <div className="flex flex-col justify-start">
            {/* Atmospheric Background */}
            <div className="bg-primary/10 pointer-events-none absolute -top-20 -left-40 -z-10 h-[300px] w-[300px] animate-pulse rounded-full" />

            {/* Heading with Icon */}
            <div className="mb-6 text-left">
              {property.status === "pending" ? (
                <>
                  <h1 className="text-on-background mb-3 text-2xl font-bold">
                    Property Created Successfully! 🎉
                  </h1>
                  <p className="text-on-surface-variant text-sm">
                    Your property has been created and submitted for review. Our
                    team will review your listing and activate it shortly.
                    We&apos;ll notify you when it&apos;s live.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-1">
                    <h1 className="text-on-background text-2xl font-bold">
                      Property Updated Successfully!
                    </h1>
                    <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                      <span className="material-symbols-outlined text-[18px] font-semibold">
                        check_circle
                      </span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    Your property details have been updated and submitted for
                    review. We&apos;ll notify you once the changes are approved.
                  </p>
                </>
              )}
            </div>

            {/* Summary */}
            <div className="border-outline-variant mb-6 rounded-lg border bg-white p-4 text-left shadow-sm">
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
                    <span className="bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-xs font-semibold">
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
                href="/properties/create"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "h-12"
                )}
              >
                List Another Property
              </Link>
              <Link
                href="/properties"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-12"
                )}
              >
                View All Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
