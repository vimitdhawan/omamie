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
import { Button } from "@/components/ui/button";
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
    startTransition(async () => {
      const result = await rejectPropertyAction(property.id);
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
    <>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setConfirming(true)}
        >
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={handleApprove}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Approve
        </Button>
      </div>

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
              from the review queue. The owner can resubmit it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
    </>
  );
}
