"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold">
          Ready to Find Your Next Rental Match?
        </h2>
        <p className="text-muted-foreground">
          Don&apos;t settle for good enough. Experience the future of
          intelligent renting today with Omamie.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
        <Button size="default" className="gap-2">
          Find Property
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Link href="/list-property">
          <Button variant="outline" size="default">
            List Your Property
          </Button>
        </Link>
      </div>
    </section>
  );
}
