"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

export function CTASection() {
  return (
    <Section variant="default">
      <SectionHeader
        title="Ready to Find Your Next Rental Match?"
        subtitle="Don't settle for good enough. Experience the future of intelligent renting today with Omamie."
      />
      <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
        <Button size="default" className="gap-2">
          Find Property
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="default">
          List Your Property
        </Button>
      </div>
    </Section>
  );
}
