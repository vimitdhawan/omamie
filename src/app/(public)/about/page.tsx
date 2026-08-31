import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "About Omamie",
  description:
    "Learn about Omamie&apos;s mission to connect tenants and property owners through intelligent matching.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Section>
        <SectionHeader
          title="About Omamie"
          subtitle="Connecting the right tenants with the right properties"
        />

        <div className="mx-auto max-w-3xl space-y-8">
          {/* What is Omamie */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">What is Omamie?</h2>
            <p className="text-muted text-sm leading-relaxed">
              Omamie is a property management platform that connects tenants and
              property owners/agents through intelligent requirement matching.
              We believe that finding the right rental property and reaching
              qualified renters shouldn&apos;t be frustrating or time-consuming.
            </p>
          </div>

          {/* The Problem We Solve */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">The Problem We Solve</h2>
            <p className="text-muted text-sm leading-relaxed">
              Today&apos;s rental market is fragmented and opaque. Tenants waste
              time browsing through irrelevant listings on multiple platforms.
              Property owners and agents struggle to reach qualified renters and
              waste resources managing unqualified inquiries.
            </p>
            <p className="text-muted text-sm leading-relaxed">
              Omamie exists to change that. By collecting structured
              requirements from both sides, we perform smart matching to ensure
              everyone&apos;s time is respected and outcomes are better.
            </p>
          </div>

          {/* How It Works Today */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">How It Works Today</h2>
            <p className="text-muted text-sm leading-relaxed">
              We&apos;re in the early stages of building Omamie. Right now,
              we&apos;re validating that both tenants and property owners want a
              better matching experience. Here&apos;s how our process works:
            </p>
            <ol className="text-muted space-y-2 text-sm leading-relaxed">
              <li>
                <strong className="text-ink">1. Tell us what you need:</strong>{" "}
                Tenants submit their rental requirements (location, budget,
                size, pet-friendliness, timeline). Property owners submit
                detailed property information.
              </li>
              <li>
                <strong className="text-ink">2. We review:</strong> Our team
                reviews submissions and ensures data quality.
              </li>
              <li>
                <strong className="text-ink">3. We match:</strong> Our team
                manually matches tenant profiles with properties, prioritizing
                quality over quantity.
              </li>
              <li>
                <strong className="text-ink">4. Both sides connect:</strong>{" "}
                Once matched, tenants and owners/agents are introduced to
                arrange viewings and next steps directly.
              </li>
            </ol>
            <p className="text-muted text-sm leading-relaxed">
              This manual, ops-assisted approach lets us learn what works and
              iterate based on real feedback. In the future, we plan to automate
              and expand the platform into a full self-service marketplace.
            </p>
          </div>

          {/* Who It&apos;s For */}
          <div className="space-y-6">
            <h2 className="text-ink text-lg font-bold">Who It&apos;s For</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-ink font-semibold">Tenants</h3>
                <p className="text-muted mt-1 text-sm leading-relaxed">
                  If you&apos;re looking for a rental property that fits your
                  needs, Omamie saves you time by matching you with properties
                  that actually meet your requirements. No more endless browsing
                  or irrelevant listings. Get matched with properties designed
                  to work for you.
                </p>
              </div>

              <div>
                <h3 className="text-ink font-semibold">
                  Property Owners & Agents
                </h3>
                <p className="text-muted mt-1 text-sm leading-relaxed">
                  If you&apos;re renting out a property, Omamie connects you
                  with pre-qualified tenants who match your property profile.
                  Reduce time spent on unqualified inquiries and focus on
                  serious prospects who are genuinely interested in your
                  property.
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/find-property"
              className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Find a Property
            </Link>
            <Link
              href="/properties/new"
              className="border-hairline bg-canvas text-ink hover:bg-surface-soft inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
