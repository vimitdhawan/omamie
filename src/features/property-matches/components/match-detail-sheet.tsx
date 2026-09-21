"use client";

import { startTransition, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getMatchTenantDetailAction } from "@/features/requirements/actions";
import { TenantDetailContent } from "@/features/requirements/components/tenant-detail-content";
import type { TenantRequestDetail } from "@/features/requirements/types";
import type { PropertyMatchWithProperty } from "../types";
import { MatchActions } from "./match-actions";

interface MatchDetailSheetProps {
  match: PropertyMatchWithProperty | null;
  onOpenChange: (open: boolean) => void;
}

export function MatchDetailSheet({
  match,
  onOpenChange,
}: MatchDetailSheetProps) {
  const [detail, setDetail] = useState<TenantRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!match) {
      startTransition(() => {
        setDetail(null);
        setIsLoading(false);
      });
      return;
    }

    let cancelled = false;
    startTransition(() => {
      setIsLoading(true);
      setDetail(null);
    });
    getMatchTenantDetailAction(match.id)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [match]);

  return (
    <Sheet open={match !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{match?.property.title}</SheetTitle>
          <SheetDescription>{match?.property.location}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading || !detail ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : (
            <TenantDetailContent detail={detail} />
          )}
        </div>

        {match && (
          <SheetFooter>
            <MatchActions matchId={match.id} currentStatus={match.status} />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
