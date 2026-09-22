"use client";

import { useState, useTransition } from "react";
import { Calendar, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { proposeViewingSlotsAction } from "@/features/viewings/actions";
import { rejectMatchAction } from "@/features/property-matches/actions";
import { getConfirmedViewing, getPendingProposals } from "../utils";
import type { MatchJourney } from "../types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The tenant's proposal form — 1 to 3 candidate times for an owner to pick from. */
function SlotProposalForm({
  matchId,
  onSubmitted,
  onWithdraw,
  isWithdrawing,
}: {
  matchId: string;
  onSubmitted: () => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}) {
  const [slots, setSlots] = useState<string[]>([""]);
  const [isPending, startTransition] = useTransition();

  const setSlot = (index: number, value: string) => {
    setSlots((current) => current.map((s, i) => (i === index ? value : s)));
  };

  const addSlot = () => {
    if (slots.length < 3) setSlots((current) => [...current, ""]);
  };

  const removeSlot = (index: number) => {
    setSlots((current) => current.filter((_, i) => i !== index));
  };

  const submit = () => {
    const filled = slots.map((s) => s.trim()).filter(Boolean);
    if (filled.length === 0) {
      toast.error("Add at least one time you're available");
      return;
    }
    startTransition(async () => {
      try {
        await proposeViewingSlotsAction(matchId, filled);
        toast.success("Sent — the owner will confirm one of your times");
        onSubmitted();
      } catch {
        toast.error("Couldn't send your times. Please try again.");
      }
    });
  };

  return (
    <Card className="bg-surface-soft/50 space-y-3 border-gray-200 p-4">
      <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <Clock className="size-4" />
        Share your available times
      </p>
      <p className="text-muted-foreground text-sm">
        This match was approved — pick up to 3 times you&apos;re free and the
        owner will confirm one.
      </p>
      <div className="space-y-2">
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={slot}
              disabled={isPending}
              onChange={(event) => setSlot(index, event.target.value)}
            />
            {slots.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Remove this time"
                disabled={isPending}
                onClick={() => removeSlot(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        {slots.length < 3 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
            disabled={isPending}
            onClick={addSlot}
          >
            <Plus className="size-3.5" />
            Add another time
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={isPending || isWithdrawing}
            onClick={onWithdraw}
          >
            Reject
          </Button>
          <Button type="button" size="sm" disabled={isPending} onClick={submit}>
            Send Times
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ViewingFlowPanel({
  journey,
  onChanged,
}: {
  journey: MatchJourney;
  onChanged?: () => void;
}) {
  const { match, viewings } = journey;
  const [proposed, setProposed] = useState(false);
  const [isWithdrawing, startWithdraw] = useTransition();
  const confirmed = getConfirmedViewing(viewings);
  const pending = getPendingProposals(viewings);

  const withdraw = () => {
    startWithdraw(async () => {
      try {
        await rejectMatchAction(match.id);
        onChanged?.();
      } catch {
        toast.error("Couldn't reject this match. Please try again.");
      }
    });
  };

  if (confirmed) {
    // Once a viewing is confirmed, the tenant can no longer reject or reschedule it
    // themselves — that needs an agent to step in, so no action is offered here.
    return (
      <Card className="bg-surface-soft/50 space-y-2 border-gray-200 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
            <Calendar className="size-4" />
            Upcoming In-Person Viewing
          </p>
          <Badge variant="secondary">Confirmed</Badge>
        </div>
        <p className="text-foreground text-sm font-medium">
          {match.property.title}
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <MapPin className="size-3.5 shrink-0" />
          {match.property.location}
        </p>
        <p className="text-muted-foreground text-sm">
          {confirmed.scheduledAt ? formatDateTime(confirmed.scheduledAt) : ""}
          {confirmed.hostName ? ` · Hosted by ${confirmed.hostName}` : ""}
        </p>
        {confirmed.accessNotes && (
          <p className="text-muted-foreground text-sm italic">
            &ldquo;{confirmed.accessNotes}&rdquo;
          </p>
        )}
      </Card>
    );
  }

  if (pending.length > 0 || proposed) {
    return (
      <Card className="bg-surface-soft/50 space-y-2 border-gray-200 p-4">
        <p className="text-foreground text-sm font-semibold">
          Waiting for the owner to confirm a time
        </p>
        <p className="text-muted-foreground text-sm">You proposed:</p>
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          {pending.map((v) => (
            <li key={v.id}>
              {v.scheduledAt ? formatDateTime(v.scheduledAt) : ""}
            </li>
          ))}
        </ul>
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={isWithdrawing}
            onClick={withdraw}
          >
            Reject
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <SlotProposalForm
      matchId={match.id}
      onSubmitted={() => {
        setProposed(true);
        onChanged?.();
      }}
      onWithdraw={withdraw}
      isWithdrawing={isWithdrawing}
    />
  );
}
