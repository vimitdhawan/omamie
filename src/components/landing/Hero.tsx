"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-x-hidden px-6 pt-24 pb-10 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16 xl:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Hero Content */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-ink text-xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Find the Right Rental Match Faster
            </h1>
            <p className="text-muted max-w-xl text-sm leading-relaxed sm:text-base">
              We connect tenants and property owners through intelligent
              matching. Tell us what you need and we&apos;ll help find the best
              fit.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="default" className="gap-2">
                Find Property
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="default">
                List Your Property
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="group relative">
            <div className="from-primary/10 to-secondary/10 absolute -inset-4 rounded-2xl bg-gradient-to-tr opacity-50 blur-3xl transition-opacity group-hover:opacity-70" />
            <div className="bg-surface-strong border-hairline relative aspect-[4/3] overflow-hidden rounded-xl border shadow-lg">
              <img
                className="h-full w-full object-cover"
                alt="Modern apartment interior with natural light"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVDrtnrHvED_qAaSCHHbcuvWihb-qatEtQ0FPSF_mDFgLssCK7dEf3SpCH8y8m0fHW4QuxrTa53mmiEugLHIXsqPOUoqGRC-HygziIB4QSqyeMy0GZ0ph23YuRFjOL4AbfR1qc8L_PLQe2Ba6TvslBfJgDsyGJ8Z20EgbQeNCXhJO_D5bTu0ppDTCPB70wzCcuYDlYGHyT3EEsvydTihhOGqaRujYZyw3zKpnN8zgM8bHtH4tQqt2ljyugD65yMIFCSriN4Q7zu2v0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
