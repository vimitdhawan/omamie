"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/custom/section";

export function Contact() {
  return (
    <Section variant="muted">
      <Card className="mx-auto max-w-2xl shadow-sm">
        <CardContent className="space-y-5 p-6 text-center sm:p-8">
          <div className="space-y-2">
            <h2 className="text-ink text-xl font-bold sm:text-2xl">
              Have a Question?
            </h2>
            <p className="text-muted mx-auto max-w-lg text-sm leading-relaxed">
              Whether you&apos;re looking to list a property, find your next
              home, explore a partnership, or simply learn more about Omamie,
              we&apos;re here to help.
            </p>
          </div>
          <div className="pt-1">
            <Button size="default">Contact Us</Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
