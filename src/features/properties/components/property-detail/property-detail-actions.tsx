"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePropertyAction } from "../../actions";
import type { Property } from "../../types";

/**
 * The single place this page offers actions. The header deliberately carries none, so there
 * is exactly one Edit and one Delete on screen.
 */
export function PropertyDetailActions({ property }: { property: Property }) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [isDeleting, startDeleting] = React.useTransition();

  const copyLink = async () => {
    const url = `${window.location.origin}/properties/${property.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Listing link copied");
    } catch {
      // Clipboard access is denied outside a secure context, and on http:// staging hosts.
      toast.error("Could not copy the link");
    }
  };

  const confirmDelete = () => {
    startDeleting(async () => {
      const result = await deletePropertyAction(property.id);

      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      toast.success(`"${property.title}" was deleted`);
      router.push("/properties");
    });
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          size="lg"
          className="w-full justify-start gap-2"
          render={<Link href={`/properties/${property.id}/edit`} />}
        >
          <Pencil className="size-4" />
          Edit property details
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full justify-start gap-2"
          onClick={copyLink}
        >
          <Link2 className="size-4" />
          Share listing link
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          className="w-full justify-start gap-2"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-4" />
          Delete listing
        </Button>
      </div>

      <AlertDialog
        open={confirming}
        onOpenChange={(next) => {
          if (!isDeleting) setConfirming(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{property.title}&rdquo; and its photos will be removed
              permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
