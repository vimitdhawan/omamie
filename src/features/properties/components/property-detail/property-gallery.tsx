"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { getPublicImageUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "../../types";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

/**
 * The listing's photos, one at a time with a thumbnail strip.
 *
 * Deliberately no carousel dependency: a single index over an array is the whole behaviour,
 * and the repo already avoids one in the tenant preview.
 */
export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [index, setIndex] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-surface-soft text-muted-foreground flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl">
        <ImageIcon className="size-8" />
        <span className="text-sm">No photos yet</span>
      </div>
    );
  }

  // A deleted photo can leave the index past the end between renders.
  const current = Math.min(index, images.length - 1);
  const step = (delta: number) =>
    setIndex((value) => (value + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div
        className="bg-surface-soft group relative aspect-[16/9] w-full overflow-hidden rounded-xl"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photos of ${title}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
      >
        <Image
          key={images[current].id}
          src={getPublicImageUrl(images[current].storagePath)}
          alt={`${title} — photo ${current + 1} of ${images.length}`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          priority={current === 0}
        />

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => step(-1)} />
            <GalleryArrow side="right" onClick={() => step(1)} />
          </>
        )}

        <span className="bg-background/90 text-foreground absolute right-3 bottom-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
          {current + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1">
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show photo ${position + 1}`}
              aria-current={position === current}
              className={cn(
                "bg-surface-soft relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-opacity",
                position === current
                  ? "ring-primary ring-2"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={getPublicImageUrl(image.storagePath)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "bg-background/90 text-foreground absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
