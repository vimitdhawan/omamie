import { CalendarClock, MapPin, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { PROPERTY_TYPES, BEDROOMS_LABELS, BATHROOMS_LABELS } from "../schema";
import type { PropertyFindRequest } from "../types";

function formatRequestedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FindRequestCard({ request }: { request: PropertyFindRequest }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-foreground text-base font-semibold">
          {PROPERTY_TYPES[request.propertyType]} ·{" "}
          {BEDROOMS_LABELS[request.bedrooms]}
        </h3>
        <Badge variant="secondary">{BATHROOMS_LABELS[request.bathrooms]}</Badge>
      </div>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <MapPin className="size-3.5 shrink-0" />
        <span className="line-clamp-1">{request.preferredLocation}</span>
      </p>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <Wallet className="size-3.5 shrink-0" />
        Up to {formatCurrency(request.monthlyBudget, "en-US", "THB")} / month
      </p>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <CalendarClock className="size-3.5 shrink-0" />
        Move-in from{" "}
        {new Date(request.moveInDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>

      {request.additionalNotes && (
        <p className="text-muted-foreground line-clamp-2 text-sm italic">
          &ldquo;{request.additionalNotes}&rdquo;
        </p>
      )}

      <p className="text-muted-foreground text-xs">
        Requested on {formatRequestedDate(request.createdAt)}
      </p>
    </Card>
  );
}
