"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { AMENITIES } from "../../schema";
import type { PropertyFormValues } from "../../schema";
import type { DraftImage } from "./types";
import { draftImageSrc } from "./types";

interface PropertyPreviewProps {
  values: PropertyFormValues;
  images: DraftImage[];
}

/**
 * How the listing will read to a tenant.
 *
 * Presentational only: it takes live form values and renders them, so nothing here can write
 * to the form or the database. Unfilled fields show placeholders rather than disappearing, so
 * the owner can see what is still missing.
 */
export function PropertyPreview({ values, images }: PropertyPreviewProps) {
  const [index, setIndex] = useState(0);

  // Removing photos can leave the stored index past the end. Clamped during render rather
  // than corrected in an effect, which would cost an extra render pass.
  const safeIndex = index >= images.length ? 0 : index;
  const current = images[safeIndex];
  const meta = [
    `${values.bedrooms} ${values.bedrooms === 1 ? "bedroom" : "bedrooms"}`,
    `${values.bathrooms} ${values.bathrooms === 1 ? "bath" : "baths"}`,
    values.areaSqm ? `${values.areaSqm} m²` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="bg-card border-hairline-soft overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-surface-soft relative aspect-[4/3]">
        {current ? (
          <Image
            src={draftImageSrc(current)}
            alt={values.title || "Property photo"}
            fill
            sizes="420px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
            <ImageIcon className="size-8" />
            <span className="text-xs">No photos yet</span>
          </div>
        )}

        {/* A tenant affordance, shown for fidelity but inert here — a dead button would
            invite the owner to click it. */}
        <span
          className="bg-background/90 text-muted-foreground absolute top-3 right-3 flex size-9 items-center justify-center rounded-full shadow-sm"
          aria-hidden
        >
          <Heart className="size-4" />
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() =>
                setIndex((safeIndex - 1 + images.length) % images.length)
              }
              className="bg-background/90 hover:bg-background absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIndex((safeIndex + 1) % images.length)}
              className="bg-background/90 hover:bg-background absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
            <span className="bg-foreground/75 text-background absolute right-3 bottom-3 rounded-full px-2 py-0.5 text-[11px] font-medium">
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-xl leading-snug font-bold">
          {values.title || (
            <span className="text-muted-foreground font-normal italic">
              Untitled listing
            </span>
          )}
        </h3>

        <p className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {values.monthlyRent
              ? formatCurrency(values.monthlyRent, "en-US", "THB")
              : "—"}
          </span>
          <span className="text-muted-foreground text-sm">per month</span>
        </p>

        <p className="text-muted-foreground text-sm">
          {values.location || "Location not set"}
        </p>

        <p className="text-foreground pt-1 text-base">{meta.join("  •  ")}</p>

        {values.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {values.amenities.slice(0, 6).map((amenity) => (
              <Badge key={amenity} variant="outline">
                {AMENITIES[amenity]}
              </Badge>
            ))}
            {values.amenities.length > 6 && (
              <Badge variant="outline">
                +{values.amenities.length - 6} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
