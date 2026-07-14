"use client";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="bg-surface-card overflow-x-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-ink text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Find Your Next Rental Match?
          </h2>
          <p className="text-muted mx-auto max-w-xl text-lg">
            Don&#39;t settle for &ldquo;good enough.&rdquo; Experience the
            future of intelligent renting today with Omamie.
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg">Find Property</Button>
            <Button variant="outline" size="lg">
              List Your Property
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
