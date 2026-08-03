"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/ui/section";
import { XCircle, Search, Home } from "lucide-react";

const painPoints = {
  tenants: {
    icon: Search,
    title: "For Tenants",
    items: [
      {
        label: "Endless browsing",
        description:
          "Hours spent scrolling through listings that don't fit your life.",
      },
      {
        label: "Irrelevant listings",
        description:
          "Outdated availability and inaccurate property descriptions.",
      },
      {
        label: "Slow responses",
        description: "Enquiries that go unanswered for days or even weeks.",
      },
    ],
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  owners: {
    icon: Home,
    title: "For Owners",
    items: [
      {
        label: "Unqualified inquiries",
        description:
          "Managing floods of messages from people who aren't a match.",
      },
      {
        label: "Vacant properties",
        description: "Every day your property sits empty is lost revenue.",
      },
      {
        label: "Time-consuming screening",
        description:
          "The headache of manually verifying every potential tenant.",
      },
    ],
    iconBg: "bg-surface-strong",
    iconColor: "text-ink",
  },
};

function PainPointCard({
  icon: Icon,
  title,
  items,
  iconBg,
  iconColor,
}: typeof painPoints.tenants) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`h-9 w-9 rounded-full ${iconBg} flex flex-shrink-0 items-center justify-center`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <h3 className="text-ink text-sm font-bold">{title}</h3>
        </div>

        {/* Pain Points List */}
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <XCircle className="text-destructive mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <div className="text-ink text-xs font-medium">{item.label}</div>
                <div className="text-muted text-xs">{item.description}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function PainPoints() {
  return (
    <Section variant="muted">
      <SectionHeader
        title="Renting Shouldn't Be This Hard"
        subtitle="Traditional marketplaces are broken. We've built a system that prioritizes relevance over volume."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        <PainPointCard {...painPoints.tenants} />
        <PainPointCard {...painPoints.owners} />
      </div>
    </Section>
  );
}
