"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/custom/section";
import {
  Sparkles,
  Clock,
  CheckCheck,
  MessageCircle,
  UserPlus,
  TrendingDown,
  Award,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const tenantBenefits: Benefit[] = [
  {
    icon: Sparkles,
    title: "Personalized",
    description: "Recommendations built for your lifestyle.",
  },
  {
    icon: Clock,
    title: "Save hours",
    description: "Cut browsing time by 85% compared to apps.",
  },
  {
    icon: CheckCheck,
    title: "Better matches",
    description: "Curated list of homes that actually fit your needs.",
  },
  {
    icon: MessageCircle,
    title: "Fast responses",
    description: "Get heard faster with our verified profile.",
  },
];

const ownerBenefits: Benefit[] = [
  {
    icon: UserPlus,
    title: "Qualified leads",
    description: "Only see tenants who are serious and vetted.",
  },
  {
    icon: TrendingDown,
    title: "Reduce vacancy",
    description: "Fill your properties 2x faster than usual.",
  },
  {
    icon: Award,
    title: "Better quality",
    description: "Connecting with tenants who value your property.",
  },
  {
    icon: Zap,
    title: "Less effort",
    description: "We handle the heavy lifting of sorting through apps.",
  },
];

function BenefitCard({ icon: Icon, title, description }: Benefit) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-2 p-5">
        <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Icon className="text-primary h-4 w-4" />
        </div>
        <h4 className="text-ink text-base font-medium">{title}</h4>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export function Benefits() {
  return (
    <Section variant="muted">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-ink text-2xl font-bold tracking-tight sm:text-3xl">
          Why People Choose Omamie
        </h2>
      </div>

      {/* Two-column layout: Tenants | Owners */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Tenants Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-hairline-soft h-px flex-1" />
            <h3 className="text-ink text-xl font-bold whitespace-nowrap">
              Why Tenants Love Omamie
            </h3>
            <div className="bg-hairline-soft h-px flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tenantBenefits.map((benefit, index) => (
              <BenefitCard key={index} {...benefit} />
            ))}
          </div>
        </div>

        {/* Owners Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-hairline-soft h-px flex-1" />
            <h3 className="text-ink text-xl font-bold whitespace-nowrap">
              Why Owners Trust Omamie
            </h3>
            <div className="bg-hairline-soft h-px flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ownerBenefits.map((benefit, index) => (
              <BenefitCard key={index} {...benefit} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
