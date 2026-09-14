"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, ImagePlus, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
} from "../../schema";
import type { DraftImage } from "./types";
import { draftImageKey, draftImageSrc } from "./types";

interface ImagesSectionProps {
  images: DraftImage[];
  onChange: (images: DraftImage[]) => void;
  error?: string;
}

export function ImagesSection({ images, onChange, error }: ImagesSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const accepted: DraftImage[] = [];
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type as never)) {
        toast.error(`${file.name} is not a JPEG, PNG or WebP image`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      if (images.length + accepted.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }
      accepted.push({
        kind: "new",
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length > 0) {
      onChange([...images, ...accepted]);
    }
  };

  const remove = (key: string) => {
    const target = images.find((image) => draftImageKey(image) === key);
    if (target?.kind === "new") {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(images.filter((image) => draftImageKey(image) !== key));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = images.findIndex(
      (image) => draftImageKey(image) === active.id
    );
    const to = images.findIndex((image) => draftImageKey(image) === over.id);
    if (from < 0 || to < 0) return;

    onChange(arrayMove(images, from, to));
  };

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      <div className="bg-surface-soft flex flex-wrap items-center justify-between gap-3 rounded-lg p-3">
        <div className="flex min-w-0 items-start gap-3">
          <ImagePlus
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {images.length} of {MAX_IMAGES} photo slots used
            </p>
            <p className="text-muted-foreground text-xs">
              JPEG, PNG or WebP, up to 5MB each. The first photo is the cover.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={!canAddMore}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Upload photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            // Reset so re-picking the same file fires change again.
            event.target.value = "";
          }}
        />
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-4 text-center text-sm transition-colors",
          dragActive
            ? "border-primary bg-primary/5 text-primary"
            : "border-hairline-soft text-muted-foreground"
        )}
      >
        Drag photos here to add them
      </div>

      <FieldError errors={error ? [{ message: error }] : undefined} />

      {images.length > 0 && (
        <>
          <p className="text-muted-foreground text-xs">
            Drag to reorder. The first photo is the cover image tenants see.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(draftImageKey)}
              strategy={rectSortingStrategy}
            >
              <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => (
                  <SortableImage
                    key={draftImageKey(image)}
                    id={draftImageKey(image)}
                    src={draftImageSrc(image)}
                    isCover={index === 0}
                    onRemove={() => remove(draftImageKey(image))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}

function SortableImage({
  id,
  src,
  isCover,
  onRemove,
}: {
  id: string;
  src: string;
  isCover: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-surface-soft group relative aspect-[4/3] overflow-hidden rounded-lg border",
        isCover && "ring-primary col-span-2 row-span-2 ring-2",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
    >
      <Image src={src} alt="" fill sizes="200px" className="object-cover" />

      {isCover && (
        <span className="bg-primary text-primary-foreground absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
          <Star className="size-3" aria-hidden />
          Cover photo
        </span>
      )}

      <button
        type="button"
        aria-label="Reorder image"
        className="bg-background/90 absolute bottom-1.5 left-1.5 cursor-grab rounded p-1 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>

      <button
        type="button"
        aria-label="Remove image"
        onClick={onRemove}
        className="bg-background/90 hover:bg-destructive hover:text-destructive-foreground absolute top-1.5 right-1.5 rounded p-1"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
