import type { ReactNode } from "react";
import { CalendarClock, MapPin, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { PROPERTY_TYPES, BEDROOMS_LABELS, BATHROOMS_LABELS } from "../schema";
import type { TenantRequirements } from "../types";

export function RequirementsSummaryCard({
  requirements,
  action,
}: {
  requirements: TenantRequirements;
  /** Optional control (e.g. an Edit button) shown in the header row. */
  action?: ReactNode;
}) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-foreground text-base font-semibold">
          {PROPERTY_TYPES[requirements.propertyType]} ·{" "}
          {BEDROOMS_LABELS[requirements.bedrooms]}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {BATHROOMS_LABELS[requirements.bathrooms]}
          </Badge>
          {action}
        </div>
      </div>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <MapPin className="size-3.5 shrink-0" />
        <span className="line-clamp-1">{requirements.preferredLocation}</span>
      </p>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <Wallet className="size-3.5 shrink-0" />
        Up to {formatCurrency(requirements.monthlyBudget, "en-US", "THB")} /
        month
      </p>

      <p className="text-muted-foreground flex items-center gap-1 text-sm">
        <CalendarClock className="size-3.5 shrink-0" />
        Move-in from{" "}
        {new Date(requirements.moveInDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>

      {requirements.additionalNotes && (
        <p className="text-muted-foreground line-clamp-2 text-sm italic">
          &ldquo;{requirements.additionalNotes}&rdquo;
        </p>
      )}
    </Card>
  );
}
