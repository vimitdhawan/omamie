"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <section className="bg-surface-soft overflow-x-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <Card className="mx-auto max-w-2xl shadow-sm">
          <CardContent className="space-y-6 p-8 text-center sm:p-10 lg:p-12">
            <div className="space-y-4">
              <h2 className="text-ink text-2xl font-bold sm:text-3xl">
                Have a Question?
              </h2>
              <p className="text-muted mx-auto max-w-lg text-base leading-relaxed">
                Whether you&#39;re looking to list a property, find your next
                home, explore a partnership, or simply learn more about Omamie,
                we&#39;re here to help.
              </p>
            </div>
            <div className="pt-2">
              <Button size="lg">Contact Us</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
