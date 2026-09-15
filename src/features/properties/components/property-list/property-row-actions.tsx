"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deletePropertyAction } from "../../actions";
import type { Property } from "../../types";

/**
 * Lets the list owning these rows drop a deleted property from its own state. The list keeps
 * `properties` in React state, so a server revalidate alone would leave the row on screen.
 */
export const PropertyListContext = React.createContext<{
  onDeleted: (propertyId: string) => void;
} | null>(null);

interface PropertyRowActionsProps {
  property: Property;
  triggerClassName?: string;
}

export function PropertyRowActions({
  property,
  triggerClassName,
}: PropertyRowActionsProps) {
  const router = useRouter();
  const list = React.useContext(PropertyListContext);
  const [confirming, setConfirming] = React.useState(false);
  const [isDeleting, startDeleting] = React.useTransition();

  const confirmDelete = () => {
    startDeleting(async () => {
      const result = await deletePropertyAction(property.id);

      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      setConfirming(false);
      toast.success(`"${property.title}" was deleted`);
      list?.onDeleted(property.id);
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${property.title}`}
          className={cn(
            "hover:bg-muted rounded p-2 transition-colors",
            triggerClassName
          )}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/properties/${property.id}/edit`)}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/properties/${property.id}`)}
          >
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirming(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirming}
        onOpenChange={(next) => {
          // A delete in flight must not be abandoned half-way through.
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
