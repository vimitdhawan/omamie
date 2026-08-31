"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createViewingRequestAction } from "../actions";

interface ViewingRequestDialogProps {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ViewingRequestDialog({
  propertyId,
  propertyTitle,
  open,
  onOpenChange,
  onSuccess,
}: ViewingRequestDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createViewingRequestAction({
        propertyId,
        message: message.trim() || undefined,
      });

      if (result.success) {
        toast.success("Viewing request sent successfully!");
        setMessage("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to send viewing request");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request a Viewing</DialogTitle>
            <DialogDescription>
              Express your interest in <strong>{propertyTitle}</strong>. The
              property owner will review your request and propose available
              viewing times.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="message" className="text-sm font-medium">
              Message to Property Owner (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and mention when you'd like to view the property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
