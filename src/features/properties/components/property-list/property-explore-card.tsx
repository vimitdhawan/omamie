"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import {
  Bath,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getPublicImageUrl } from "@/lib/storage-url";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toggleFavoriteAction } from "@/features/favorites/actions";
import type { Property } from "@/features/properties/types";

interface PropertyExploreCardProps {
  property: Property;
  isFavorited: boolean;
  isInterested: boolean;
}

export function PropertyExploreCard({
  property,
  isFavorited,
  isInterested,
}: PropertyExploreCardProps) {
  const [isTogglingFavorite, startFavoriteTransition] = useTransition();
  const [favorited, setFavorited] = useState(isFavorited);
  const [imageIndex, setImageIndex] = useState(0);

  const images = property.images;
  const activeImage = images[imageIndex];
  const hasMultipleImages = images.length > 1;

  const handleToggleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    startFavoriteTransition(async () => {
      const previous = favorited;
      setFavorited(!previous);
      try {
        const result = await toggleFavoriteAction(property.id);
        setFavorited(result.favorited);
      } catch {
        setFavorited(previous);
        toast.error("Failed to update favorites");
      }
    });
  };

  const handlePrevImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const handleNextImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <Card className="overflow-hidden p-0">
      <Link
        href={`/explore/${property.id}`}
        target="_blank"
        className="block"
        aria-label={`View details for ${property.title}`}
      >
        <div className="bg-surface-soft relative aspect-[4/3] w-full">
          {activeImage ? (
            <Image
              src={getPublicImageUrl(activeImage.storagePath)}
              alt={property.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <ImageIcon className="size-8" />
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="bg-background/80 absolute top-1/2 left-2 grid size-7 -translate-y-1/2 place-items-center rounded-full shadow-sm transition-opacity hover:opacity-90"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next photo"
                className="bg-background/80 absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full shadow-sm transition-opacity hover:opacity-90"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            aria-label={favorited ? "Remove from saved" : "Save property"}
            aria-pressed={favorited}
            className="bg-background/90 absolute top-3 right-3 grid size-8 place-items-center rounded-full shadow-sm transition-opacity hover:opacity-90"
          >
            <Heart
              className={cn(
                "size-4",
                favorited ? "fill-red-500 text-red-500" : "text-foreground"
              )}
            />
          </button>

          {isInterested && (
            <Badge className="bg-background/90 text-foreground absolute top-3 left-3 shadow-sm">
              Request Sent
            </Badge>
          )}

          <div className="absolute right-3 bottom-3 left-3">
            <span className="inline-block truncate rounded-md bg-black/60 px-2.5 py-1 text-sm font-medium text-white">
              {property.title}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <h3 className="text-foreground line-clamp-1 text-base font-semibold">
            {property.title}
          </h3>

          <p className="text-foreground text-lg font-bold">
            {property.monthlyRent != null
              ? formatCurrency(property.monthlyRent, "en-US", "THB")
              : "Price on request"}
            {property.monthlyRent != null && (
              <span className="text-muted-foreground ml-1 text-sm font-normal">
                per month
              </span>
            )}
          </p>

          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <span className="flex items-center gap-1">
              {property.bedrooms} {property.bedrooms === 1 ? "room" : "rooms"}
            </span>
            <span aria-hidden>•</span>
            <span className="flex items-center gap-1">
              <Bath className="size-3.5" />
              {property.bathrooms}
            </span>
            {property.areaSqm != null && (
              <>
                <span aria-hidden>•</span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="size-3.5" />
                  {property.areaSqm} m²
                </span>
              </>
            )}
          </div>

          <div className="border-hairline-soft border-t pt-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Calendar className="size-3.5" />
              {property.availableFrom
                ? `Available from ${formatDate(property.availableFrom)}`
                : "Availability on request"}
            </p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
