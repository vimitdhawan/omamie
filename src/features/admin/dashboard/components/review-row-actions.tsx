"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  approvePropertyAction,
  rejectPropertyAction,
} from "../../properties/actions";
import { ReviewQueueContext } from "./review-queue-context";
import type { AdminPropertySummary } from "../../properties/types";

export function ReviewRowActions({
  property,
}: {
  property: AdminPropertySummary;
}) {
  const router = useRouter();
  const list = React.useContext(ReviewQueueContext);
  const [confirming, setConfirming] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approvePropertyAction(property.id);
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      list?.onResolved(property.id);
      toast.success(`"${property.title}" was approved`);
      router.refresh();
    });
  };

  const handleReject = () => {
    if (!reason.trim()) {
      setReasonError("Please explain what's missing");
      return;
    }
    startTransition(async () => {
      const result = await rejectPropertyAction(property.id, reason.trim());
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      setConfirming(false);
      list?.onResolved(property.id);
      toast.success(`"${property.title}" was rejected`);
      router.refresh();
    });
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isPending}
            />
          }
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/properties/${property.id}`} />}
          >
            View
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isPending} onClick={handleApprove}>
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              setReason("");
              setReasonError(null);
              setConfirming(true);
            }}
          >
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirming}
        onOpenChange={(next) => {
          if (!isPending) setConfirming(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{property.title}&rdquo; will be marked inactive and removed
              from the review queue. Let the owner know what&apos;s missing so
              they can fix it and resubmit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (reasonError) setReasonError(null);
              }}
              placeholder="e.g. Photos are missing, address is incomplete..."
              disabled={isPending}
              rows={3}
            />
            {reasonError && (
              <p className="text-destructive text-xs">{reasonError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleReject}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Reject
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
