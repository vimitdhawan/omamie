"use client";

import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";

export default function CTASection() {
  return (
    <Section variant="default">
      <SectionHeader
        title="Ready to Find Your Next Rental Match?"
        subtitle="Don't settle for good enough. Experience the future of intelligent renting today with Omamie."
      />
      <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
        <Button size="default">Find Property</Button>
        <Button variant="outline" size="default">
          List Your Property
        </Button>
      </div>
    </Section>
  );
}
