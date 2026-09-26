"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_SUBJECT_OPTIONS } from "@/features/contact/schema";
import { completeContactMessageAction } from "../actions";
import type { AdminContactMessage } from "../types";

const SUBJECT_LABEL: Record<string, string> = Object.fromEntries(
  CONTACT_SUBJECT_OPTIONS.map((option) => [option.value, option.label])
);

export function ContactMessageDialog({
  message,
  open,
  onOpenChange,
}: {
  message: AdminContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!message) return null;

  return (
    <ContactMessageDialogContent
      // Remounts (and so resets the form state) whenever a different message is opened.
      key={message.id}
      message={message}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function ContactMessageDialogContent({
  message,
  open,
  onOpenChange,
}: {
  message: AdminContactMessage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleComplete = () => {
    if (!resolutionNote.trim()) {
      setReasonError("Please describe how this was resolved");
      return;
    }
    startTransition(async () => {
      const result = await completeContactMessageAction(
        message.id,
        resolutionNote.trim()
      );
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      toast.success(`Marked "${message.fullName}"'s message as completed`);
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {message.fullName}
            <Badge
              variant={message.status === "open" ? "secondary" : "default"}
            >
              {message.status === "open" ? "Open" : "Completed"}
            </Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Submitted {new Date(message.createdAt).toLocaleString()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-medium">Email</dt>
            <dd>{message.email}</dd>
            <dt className="font-medium">Phone</dt>
            <dd>{message.phone ?? "—"}</dd>
            <dt className="font-medium">Subject</dt>
            <dd>{SUBJECT_LABEL[message.subject] ?? message.subject}</dd>
          </dl>
          <p className="text-foreground rounded-md border p-3 text-sm whitespace-pre-wrap">
            {message.message}
          </p>
        </div>

        {message.status === "completed" ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Resolution</p>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {message.resolutionNote}
            </p>
            {message.resolvedAt && (
              <p className="text-muted-foreground text-xs">
                Resolved {new Date(message.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Textarea
              value={resolutionNote}
              onChange={(event) => {
                setResolutionNote(event.target.value);
                if (reasonError) setReasonError(null);
              }}
              placeholder="e.g. Called the customer and resolved the billing issue..."
              disabled={isPending}
              rows={3}
            />
            {reasonError && (
              <p className="text-destructive text-xs">{reasonError}</p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {message.status === "open" && (
            <Button type="button" disabled={isPending} onClick={handleComplete}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Mark completed
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
