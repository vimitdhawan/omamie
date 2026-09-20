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
import { approvePropertyAction, rejectPropertyAction } from "../actions";

export function PropertyReviewActions({
  propertyId,
  title,
}: {
  propertyId: string;
  title: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approvePropertyAction(propertyId);
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      toast.success(`"${title}" was approved`);
      router.refresh();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectPropertyAction(propertyId);
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      setConfirming(false);
      toast.success(`"${title}" was rejected`);
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isPending}
          onClick={() => setConfirming(true)}
        >
          Reject
        </Button>
        <Button
          type="button"
          className="flex-1"
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
              &ldquo;{title}&rdquo; will be marked inactive and removed from the
              review queue. The owner can resubmit it later.
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
