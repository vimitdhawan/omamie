"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getViewingsForMatchAction,
  confirmViewingSlotAction,
} from "../actions";
import type { Viewing } from "../types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Shown on an approved match in the owner's match detail sheet: the tenant's proposed
 * viewing times, with a Confirm button per slot, or the already-confirmed time.
 */
export function ViewingSlotPicker({ matchId }: { matchId: string }) {
  const [viewings, setViewings] = useState<Viewing[] | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getViewingsForMatchAction(matchId).then((result) => {
      if (!cancelled) setViewings(result);
    });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (viewings === null) return null;

  const confirmed = viewings.find((v) => v.status === "confirmed");
  const pending = viewings.filter((v) => v.status === "requested");

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="size-3.5" />
        <span>
          Viewing confirmed for{" "}
          {confirmed.scheduledAt ? formatDateTime(confirmed.scheduledAt) : "—"}
        </span>
        <Badge variant="secondary">Confirmed</Badge>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Waiting for the tenant to share their available times.
      </p>
    );
  }

  const confirm = (viewingId: string) => {
    startTransition(async () => {
      try {
        const result = await confirmViewingSlotAction(matchId, viewingId);
        setViewings((current) =>
          (current ?? []).map((v) =>
            v.id === result.id
              ? result
              : v.status === "requested"
                ? { ...v, status: "cancelled" }
                : v
          )
        );
        toast.success("Viewing confirmed");
      } catch {
        toast.error("Couldn't confirm this time. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Tenant&apos;s proposed times</p>
      {pending.map((viewing) => (
        <div
          key={viewing.id}
          className="flex items-center justify-between gap-2"
        >
          <span className="text-sm">
            {viewing.scheduledAt ? formatDateTime(viewing.scheduledAt) : "—"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => confirm(viewing.id)}
          >
            Confirm
          </Button>
        </div>
      ))}
    </div>
  );
}
