"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { decideLeaseAction } from "@/features/property-matches/actions";
import { getConfirmedViewing } from "../utils";
import type { MatchJourney } from "../types";

/** The viewing date has passed — the tenant now says whether they want to move forward.
 * Confirming does not create a `leases` row itself (there is no write path for that
 * anywhere in the app yet); it hands the tenant off to ops for contract signing. */
export function CompletedPanel({
  journey,
  onChanged,
}: {
  journey: MatchJourney;
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { match, viewings } = journey;
  const confirmedViewing = getConfirmedViewing(viewings);

  const decide = (decision: "confirmed" | "declined") => {
    startTransition(async () => {
      try {
        await decideLeaseAction(match.id, decision);
        toast.success(
          decision === "confirmed"
            ? "Great! Our team will reach out to arrange your lease signing."
            : "Got it — we'll keep looking for other matches."
        );
        onChanged?.();
      } catch {
        toast.error("Couldn't record your decision. Please try again.");
      }
    });
  };

  if (match.leaseDecision === "confirmed") {
    return (
      <Card className="bg-success-soft border-success/30 flex items-center justify-between gap-2 p-4">
        <p className="text-sm font-medium">
          {match.property.title} — interested to rent, our team will be in touch
        </p>
        <a
          href="/my-rentals"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View Active Lease
        </a>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-soft/50 space-y-3 border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground text-sm font-semibold">
          {match.property.title}
        </p>
        <Badge variant="secondary">Viewing done</Badge>
      </div>
      {confirmedViewing?.scheduledAt && (
        <p className="text-muted-foreground text-sm">
          Viewed on{" "}
          {new Date(confirmedViewing.scheduledAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
      <p className="text-muted-foreground text-sm">
        Ready to move forward, or was it not the right fit?
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={isPending}
          className="gap-1.5"
          onClick={() => decide("confirmed")}
        >
          <CheckCircle2 className="size-4" />
          Interested to Rent
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="gap-1.5"
          onClick={() => decide("declined")}
        >
          <XCircle className="size-4" />
          Reject
        </Button>
      </div>
    </Card>
  );
}
