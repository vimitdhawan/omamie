"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateViewingRequestStatusAction } from "../actions";
import type { ViewingRequestStatus } from "../types";
import { useToast } from "@/hooks/use-toast";

interface ViewingRequestActionsProps {
  requestId: string;
  currentStatus: ViewingRequestStatus;
  onStatusChange?: () => void;
}

/**
 * Action buttons for updating viewing request status
 * Shows appropriate actions based on current status
 */
export function ViewingRequestActions({
  requestId,
  currentStatus,
  onStatusChange,
}: ViewingRequestActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: ViewingRequestStatus) => {
    startTransition(async () => {
      const result = await updateViewingRequestStatusAction({
        requestId,
        status: newStatus,
      });

      if (result.errorMessage) {
        toast({
          title: "Error",
          description: result.errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Request ${newStatus} successfully`,
        });
        onStatusChange?.();
      }
    });
  };

  // Define available actions based on current status
  const getAvailableActions = () => {
    switch (currentStatus) {
      case "pending":
        return [
          { label: "Accept", status: "accepted" as const, variant: "default" },
          {
            label: "Decline",
            status: "declined" as const,
            variant: "destructive",
          },
          { label: "Cancel", status: "cancelled" as const, variant: "outline" },
        ];
      case "accepted":
        return [
          {
            label: "Mark Completed",
            status: "completed" as const,
            variant: "default",
          },
          { label: "Cancel", status: "cancelled" as const, variant: "outline" },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return null;
  }

  // If only one action, show as a button
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <Button
        onClick={() => handleStatusChange(action.status)}
        disabled={isPending}
        variant={
          action.variant as "default" | "destructive" | "outline" | "secondary"
        }
        size="sm"
      >
        {isPending ? "Processing..." : action.label}
      </Button>
    );
  }

  // If multiple actions, show as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending} size="sm">
          {isPending ? "Processing..." : "Actions"}
          <span className="material-symbols-outlined ml-1 text-base">
            expand_more
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.status}
            onClick={() => handleStatusChange(action.status)}
            className={
              action.variant === "destructive"
                ? "text-destructive focus:text-destructive"
                : undefined
            }
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
