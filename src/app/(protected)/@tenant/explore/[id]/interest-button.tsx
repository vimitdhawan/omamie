"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createMatchAction } from "@/features/property-matches/actions";

const STAY_DURATIONS = [
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
  { label: "24 months", months: 24 },
] as const;

/** "YYYY-MM-DD" + N months, without reintroducing a timezone shift. */
function addMonths(dateStr: string, months: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function InterestButton({
  propertyId,
  initialInterested,
}: {
  propertyId: string;
  initialInterested: boolean;
}) {
  const [interested, setInterested] = useState(initialInterested);
  const [open, setOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [durationMonths, setDurationMonths] = useState<number | null>(null);
  const [moveOutDate, setMoveOutDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDurationSelect = (months: number) => {
    setDurationMonths(months);
    if (moveInDate) {
      setMoveOutDate(addMonths(moveInDate, months));
    }
  };

  const handleMoveInDateChange = (value: string) => {
    setMoveInDate(value);
    if (durationMonths && value) {
      setMoveOutDate(addMonths(value, durationMonths));
    }
  };

  const handleSubmit = () => {
    if (isPending) return;
    startTransition(async () => {
      try {
        await createMatchAction(propertyId, {
          requestedMoveInDate: moveInDate || undefined,
          requestedMoveOutDate: moveOutDate || undefined,
        });
        setInterested(true);
        setOpen(false);
        toast.success("Interest sent! The owner will be in touch.");
      } catch {
        toast.error("Failed to send interest");
      }
    });
  };

  if (interested) {
    return (
      <Button
        type="button"
        size="lg"
        className="w-full justify-start gap-2"
        disabled
      >
        <Heart className="size-4" />
        Request Sent
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            size="lg"
            className="w-full justify-start gap-2"
          />
        }
      >
        <Heart className="size-4" />
        I&apos;m Interested
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Share your interest</SheetTitle>
          <p className="text-muted-foreground text-sm">
            Let the owner know when you&apos;d like to move in and how long you
            plan to stay.
          </p>
        </SheetHeader>

        <div className="space-y-5 px-4">
          <div className="space-y-2">
            <Label htmlFor="move-in-date">Move-in date</Label>
            <Input
              id="move-in-date"
              type="date"
              value={moveInDate}
              onChange={(event) => handleMoveInDateChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Stay duration</Label>
            <div className="flex flex-wrap gap-2">
              {STAY_DURATIONS.map((option) => (
                <button
                  key={option.months}
                  type="button"
                  onClick={() => handleDurationSelect(option.months)}
                  className={
                    durationMonths === option.months
                      ? "border-primary bg-primary text-primary-foreground rounded-full border px-3 py-1.5 text-sm font-medium"
                      : "border-hairline-soft text-foreground rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="move-out-date">Move-out date (optional)</Label>
            <Input
              id="move-out-date"
              type="date"
              value={moveOutDate}
              onChange={(event) => setMoveOutDate(event.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Send Interest
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
