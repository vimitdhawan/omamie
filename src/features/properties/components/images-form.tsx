"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyStepper } from "./property-stepper";
import { submitImagesAction } from "../actions";
import type { PropertyActionState } from "../schema";
import type { Property } from "../types";
import { PropertyNextAction } from "../types";
import { cn } from "@/lib/utils";
import { getPublicImageUrl } from "@/lib/storage-url";

interface ImagesFormProps {
  property: Property;
  onSuccess?: (updatedProperty: Property) => void;
  onBack?: () => void;
}

export function ImagesForm({ property, onSuccess, onBack }: ImagesFormProps) {
  const [existingImages, setExistingImages] = useState<string[]>(
    property.images || []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<
    PropertyActionState | null,
    FormData
  >(submitImagesAction, null);

  const totalImages = existingImages.length + newFiles.length;
  const canAddMore = totalImages < 10;

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const newFileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (newFileArray.length + totalImages > 10) {
      toast.error(`Maximum 10 images allowed. Current: ${totalImages}`);
      return;
    }

    setNewFiles([...newFiles, ...newFileArray]);
    newFileArray.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => new Map(prev).set(file, url));
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const fileToRemove = newFiles[index];
    const url = previewUrls.get(fileToRemove);
    if (url) {
      URL.revokeObjectURL(url);
    }
    setPreviewUrls((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileToRemove);
      return newMap;
    });
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.success && onSuccess) {
      const updatedProperty = {
        ...property,
        images: [...existingImages, ...newFiles.map(() => "")],
        nextAction: PropertyNextAction.REVIEW,
      };
      onSuccess(updatedProperty);
    }
  }, [state, onSuccess, property, existingImages, newFiles]);

  const handleSubmit = (formData: FormData) => {
    formData.append("propertyId", property.id);
    formData.append("keepImagePaths", JSON.stringify(existingImages));
    newFiles.forEach((file) => formData.append("images", file));
    formAction(formData);
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <PropertyStepper currentStep={3} />

      <Card className="bg-surface-soft/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Add Property Images</CardTitle>
          <CardDescription className="text-base">
            Upload images of your property (0-10 images)
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="propertyId" value={property.id} />
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 bg-gray-50/50",
                !canAddMore && "opacity-50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="images"
                accept="image/*"
                multiple
                disabled={!canAddMore || isPending}
                onChange={(e) => handleFileChange(e.target.files)}
                className="sr-only"
              />
              <div
                onClick={() => canAddMore && fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center gap-3",
                  canAddMore && "cursor-pointer"
                )}
              >
                <Upload className="text-primary h-8 w-8" />
                <div>
                  <p className="text-on-surface font-semibold">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <p className="text-on-surface-variant mt-3 text-sm">
                {totalImages}/10 images
              </p>
            </div>

            {/* Image Thumbnails Grid */}
            {totalImages > 0 && (
              <div className="space-y-2">
                <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
                  Images
                </p>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {/* Existing images */}
                  {existingImages.map((imagePath, index) => (
                    <div key={`existing-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPublicImageUrl(imagePath)}
                        alt={`Image ${index + 1}`}
                        className="bg-surface-container-low h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        disabled={isPending}
                        className="bg-destructive/90 hover:bg-destructive absolute top-1 right-1 rounded p-0.5 text-white transition-colors disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {/* New images */}
                  {newFiles.map((file, index) => {
                    const url = previewUrls.get(file);
                    return (
                      <div key={`new-${index}`} className="relative">
                        {url && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`New image ${index + 1}`}
                              className="bg-surface-container-low h-24 w-full rounded-lg object-cover"
                            />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          disabled={isPending}
                          className="bg-destructive/90 hover:bg-destructive absolute top-1 right-1 rounded p-0.5 text-white transition-colors disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {state?.errorMessage && (
              <FieldError errors={[{ message: state.errorMessage }]} />
            )}
          </CardContent>
          <CardFooter className="bg-surface-strong mt-8 flex flex-col gap-4">
            <div className="flex w-full justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onBack?.() ||
                  onSuccess?.({
                    ...property,
                    nextAction: PropertyNextAction.AMENITIES,
                  })
                }
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer px-4"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
