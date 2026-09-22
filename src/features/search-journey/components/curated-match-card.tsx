"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { Bath, ImageIcon, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicImageUrl } from "@/lib/storage-url";
import { formatCurrency } from "@/lib/utils/format";
import {
  rejectMatchAction,
  expressInterestAction,
} from "@/features/property-matches/actions";
import type { MatchJourney } from "../types";

interface CuratedMatchCardProps {
  journey: MatchJourney;
  /** Fired after a successful interest/dismiss so the parent can refresh its list. */
  onChanged?: () => void;
}

/**
 * A curated suggestion, sized to sit inside the request card's grid rather than the
 * 4-up explore grid `PropertyExploreCard` is tuned for — same visual language (image,
 * price, beds/baths/area) but with match-engine actions (Interest / Dismiss) instead of
 * a favorite toggle, and without wrapping the whole card in a `target="_blank"` link.
 */
export function CuratedMatchCard({
  journey,
  onChanged,
}: CuratedMatchCardProps) {
  const [isPending, startTransition] = useTransition();
  const { match, property } = journey;
  const coverImage = property?.images?.[0];
  const isCurated = match.status === "curated";

  const handleInterest = (event: React.MouseEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await expressInterestAction(match.id);
        toast.success("Interest sent — the owner will review it");
        onChanged?.();
      } catch {
        toast.error("Couldn't send interest. Please try again.");
      }
    });
  };

  const handleReject = (event: React.MouseEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await rejectMatchAction(match.id);
        onChanged?.();
      } catch {
        toast.error("Couldn't reject this match. Please try again.");
      }
    });
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-surface-soft relative aspect-[4/3]">
        {coverImage ? (
          <Image
            src={getPublicImageUrl(coverImage.storagePath)}
            alt={match.property.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="text-muted-foreground size-8" />
          </div>
        )}
        {match.matchScore !== null && (
          <Badge className="bg-background/90 text-foreground absolute top-3 left-3 shadow-sm">
            {match.matchScore}% Match
          </Badge>
        )}
        {match.status !== "curated" && (
          <Badge
            variant="secondary"
            className="bg-background/90 absolute top-3 right-3 shadow-sm"
          >
            {match.status === "interested" ? "Interest sent" : "Approved"}
          </Badge>
        )}
      </div>

      <div className="space-y-2 p-3">
        <h4 className="text-foreground line-clamp-1 text-sm font-semibold">
          {match.property.title}
        </h4>
        <p className="text-foreground text-base font-bold">
          {formatCurrency(match.property.monthlyRent, "en-US", "THB")}
        </p>
        <p className="text-muted-foreground line-clamp-1 text-xs">
          {match.property.location}
        </p>
        {property && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span>
              {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
            </span>
            <span aria-hidden>•</span>
            <span className="flex items-center gap-1">
              <Bath className="size-3" />
              {property.bathrooms} Bath
            </span>
            {property.areaSqm != null && (
              <>
                <span aria-hidden>•</span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="size-3" />
                  {property.areaSqm} m²
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link
            href={`/explore/${match.propertyId}`}
            target="_blank"
            className="flex-1"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
            >
              View Details
            </Button>
          </Link>
          {isCurated ? (
            <>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                disabled={isPending}
                onClick={handleInterest}
              >
                I&apos;m Interested
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Dismiss this suggestion"
                disabled={isPending}
                onClick={handleReject}
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive gap-1.5"
              disabled={isPending}
              onClick={handleReject}
            >
              <X className="size-3.5" />
              Reject
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
