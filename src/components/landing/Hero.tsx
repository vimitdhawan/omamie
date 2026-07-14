"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-x-hidden px-4 pt-28 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        {/* Search Bar Pill */}
        <div className="mx-auto mb-12 max-w-4xl">
          {/* Desktop: Full 3-segment pill */}
          <div className="hidden md:block">
            <div className="bg-canvas border-hairline flex h-[64px] items-center rounded-full border px-2 shadow-sm">
              {/* Where */}
              <div className="border-hairline flex min-w-0 flex-1 items-center gap-2 border-r px-5 py-2">
                <MapPin className="text-muted h-5 w-5 flex-shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-muted text-xs font-medium">Where</div>
                  <div className="text-ink truncate text-sm">Anywhere</div>
                </div>
                <ChevronDown className="text-muted h-5 w-5 flex-shrink-0" />
              </div>
              {/* When */}
              <div className="border-hairline flex min-w-0 flex-1 items-center gap-2 border-r px-5 py-2">
                <Calendar className="text-muted h-5 w-5 flex-shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-muted text-xs font-medium">When</div>
                  <div className="text-ink truncate text-sm">Add dates</div>
                </div>
                <ChevronDown className="text-muted h-5 w-5 flex-shrink-0" />
              </div>
              {/* Who */}
              <div className="flex min-w-0 flex-1 items-center gap-2 px-5 py-2">
                <Users className="text-muted h-5 w-5 flex-shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-muted text-xs font-medium">Who</div>
                  <div className="text-ink truncate text-sm">Add guests</div>
                </div>
                <ChevronDown className="text-muted h-5 w-5 flex-shrink-0" />
              </div>
              {/* Search Orb */}
              <Button
                size="icon"
                className="bg-primary hover:bg-primary-active ml-2 flex-shrink-0 rounded-full shadow-sm"
                aria-label="Search properties"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile: Single tappable pill */}
          <div className="md:hidden">
            <button className="bg-canvas border-hairline flex h-14 w-full items-center justify-between rounded-full border px-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="text-muted h-5 w-5 flex-shrink-0" />
                <span className="text-muted text-sm">Search properties</span>
              </div>
              <ChevronDown className="text-muted h-5 w-5 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-ink text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find the Right Rental Match Faster
            </h1>
            <p className="text-muted max-w-xl text-lg leading-relaxed sm:text-xl">
              We connect tenants and property owners through intelligent
              matching. Tell us what you need and we&#39;ll help find the best
              fit.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2">
                Find Property
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
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
