"use client";

import { useTransition } from "react";
import { createMatchAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface ShowInterestButtonProps {
  propertyId: string;
}

export function ShowInterestButton({ propertyId }: ShowInterestButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleShowInterest = () => {
    startTransition(async () => {
      try {
        await createMatchAction(propertyId);
        toast.success("Interest recorded! Check Matches to see it.");
      } catch {
        toast.error("Failed to show interest");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={handleShowInterest}
      disabled={isPending}
    >
      <Heart className="size-4" />
      Show Interest
    </Button>
  );
}
