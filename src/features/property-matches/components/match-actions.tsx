"use client";

import { useTransition } from "react";
import { updateMatchStatusAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, MoreVertical, XCircle } from "lucide-react";
import { toast } from "sonner";

const VALID_TRANSITIONS: Record<string, { label: string; status: string }[]> = {
  interested: [
    { label: "Approve", status: "approved" },
    { label: "Reject", status: "rejected" },
  ],
  approved: [],
  rejected: [],
};

interface MatchActionsProps {
  matchId: string;
  currentStatus: string;
  /** "menu" renders a 3-dot dropdown (table rows); "buttons" renders the actions inline
   * (detail sheet). Defaults to "buttons". */
  variant?: "menu" | "buttons";
}

export function MatchActions({
  matchId,
  currentStatus,
  variant = "buttons",
}: MatchActionsProps) {
  const [isPending, startTransition] = useTransition();

  const actions = VALID_TRANSITIONS[currentStatus] || [];

  if (actions.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">
        {currentStatus === "approved" ? "✓ Approved" : "✗ Rejected"}
      </span>
    );
  }

  const handleAction = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateMatchStatusAction({
          matchId,
          status: newStatus as "interested" | "approved" | "rejected",
        });
        toast.success(`Match ${newStatus}`);
      } catch {
        toast.error("Failed to update match");
      }
    });
  };

  if (variant === "menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={isPending}
              aria-label="Match actions"
            />
          }
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.status}
              variant={action.status === "rejected" ? "destructive" : "default"}
              onClick={() => handleAction(action.status)}
            >
              {action.status === "approved" ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handleAction(action.status)}
          className="gap-2"
        >
          {action.status === "approved" ? (
            <CheckCircle className="size-4 text-green-600" />
          ) : (
            <XCircle className="size-4 text-red-600" />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
