"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/custom/section";

export function CTASection() {
  return (
    <Section variant="default">
      <SectionHeader
        title="Ready to Find Your Next Rental Match?"
        subtitle="Don't settle for good enough. Experience the future of intelligent renting today with Omamie."
      />
      <div className="flex justify-center gap-4 pt-2 sm:flex-row">
        <Link href="/signup?intent=find-property">
          <Button size="default" className="cursor-pointer gap-2">
            Find Property
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/signup?intent=list-property">
          <Button variant="outline" className="cursor-pointer">
            List Your Property
          </Button>
        </Link>
      </div>
    </Section>
  );
}
