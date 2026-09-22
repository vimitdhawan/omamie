import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import {
  BATHROOMS_LABELS,
  BEDROOMS_LABELS,
  PROPERTY_TYPES,
} from "@/features/requirements/schema";
import type { TenantRequirements } from "@/features/requirements/types";
import type { StageCounts } from "../types";

/**
 * The sidebar's "Search Request" card: the single request's details + Edit, when one
 * exists — otherwise the "create your first request" prompt. Only one request can ever
 * exist per tenant, so this is the one place that both creates and edits it.
 */
function SearchRequestCard({
  requirements,
  requestCode,
  onOpenDrawer,
}: {
  requirements: TenantRequirements | null;
  requestCode: string | null;
  onOpenDrawer: () => void;
}) {
  if (!requirements) {
    return (
      <Card className="bg-surface-soft/50 flex flex-col items-start gap-3 border-gray-200 p-6">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <Sparkles className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">
          Can&apos;t find the perfect place?
        </h3>
        <p className="text-muted-foreground text-sm">
          Tell us exactly what you&apos;re looking for and we&apos;ll curate
          matches for you.
        </p>
        <Button
          type="button"
          className="mt-1 w-full gap-1.5"
          onClick={onOpenDrawer}
        >
          Create Search Request
          <ArrowRight className="size-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 border-gray-200 p-6">
      <div className="flex items-center gap-2">
        <span className="text-uppercase-tag text-muted-foreground tracking-wider uppercase">
          {requestCode}
        </span>
        <Badge variant="secondary">
          {PROPERTY_TYPES[requirements.propertyType]} ·{" "}
          {BEDROOMS_LABELS[requirements.bedrooms]}
        </Badge>
      </div>
      <h3 className="text-foreground text-base font-semibold">
        {PROPERTY_TYPES[requirements.propertyType]} ·{" "}
        {BEDROOMS_LABELS[requirements.bedrooms]} ·{" "}
        {BATHROOMS_LABELS[requirements.bathrooms]}
      </h3>
      <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          {requirements.preferredLocation}
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="size-3.5 shrink-0" />
          Up to {formatCurrency(requirements.monthlyBudget, "en-US", "THB")} /
          mo
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5 shrink-0" />
          Move-in from{" "}
          {new Date(requirements.moveInDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        onClick={onOpenDrawer}
      >
        <Pencil className="size-3.5" />
        Edit Search
      </Button>
    </Card>
  );
}

/** The mock's "Search Summary" rail: live counts, the request card (create-or-edit), and
 * the static Omamie trust copy. */
export function SearchSummaryPanel({
  counts,
  requirements,
  requestCode,
  onOpenDrawer,
}: {
  counts: StageCounts;
  requirements: TenantRequirements | null;
  requestCode: string | null;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="bg-surface-soft/50 space-y-4 border-gray-200 p-6">
        <p className="text-uppercase-tag text-muted-foreground tracking-wider uppercase">
          Search Summary
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-foreground text-2xl font-bold">
              {counts.matches}
            </p>
            <p className="text-muted-foreground text-xs">Active Matches</p>
          </div>
          <div>
            <p className="text-foreground text-2xl font-bold">
              {counts.viewing}
            </p>
            <p className="text-muted-foreground text-xs">In Viewing</p>
          </div>
          <div>
            <p className="text-foreground text-2xl font-bold">
              {counts.completed}
            </p>
            <p className="text-muted-foreground text-xs">Completed</p>
          </div>
        </div>
        <p className="text-muted-foreground border-hairline-soft border-t pt-3 text-sm">
          Questions about a match or viewing?{" "}
          <Link href="/contact" className="text-primary font-medium">
            Contact Us
          </Link>
        </p>
      </Card>

      <SearchRequestCard
        requirements={requirements}
        requestCode={requestCode}
        onOpenDrawer={onOpenDrawer}
      />

      <Card className="space-y-3 border-gray-200 p-6">
        <p className="text-uppercase-tag text-muted-foreground flex items-center gap-1.5 tracking-wider uppercase">
          <ShieldCheck className="size-3.5" />
          Omamie Promise
        </p>
        <ul className="text-muted-foreground space-y-2 text-sm">
          <li>100% verified listings with certified property hosts</li>
          <li>Dedicated leasing specialist coordinates every viewing</li>
          <li>Omamie escrow guarantees deposit safety</li>
        </ul>
      </Card>
    </div>
  );
}
