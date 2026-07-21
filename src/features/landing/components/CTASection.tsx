"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export default function CTASection() {
  return (
    <Section variant="default">
      <SectionHeader
        title="Ready to Find Your Next Rental Match?"
        subtitle="Don't settle for good enough. Experience the future of intelligent renting today with Omamie."
      />
      <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
        <Link
          href="/search"
          className="btn btn-primary btn-default flex items-center gap-2"
        >
          Find Property
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/list-property" className="btn btn-outline btn-default">
          List Your Property
        </Link>
      </div>
    </Section>
  );
}
