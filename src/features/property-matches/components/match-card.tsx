import Link from "next/link";
import { CheckCircle2, Clock, Home, MapPin, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import type { PropertyMatchWithProperty, MatchStatus } from "../types";

const STATUS_PILL: Record<
  MatchStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  curated: {
    label: "New suggestion",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  dismissed: {
    label: "Dismissed",
    icon: XCircle,
    className: "bg-muted text-muted-foreground",
  },
  interested: {
    label: "Waiting for owner",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary",
  },
  rejected: {
    label: "Not available",
    icon: XCircle,
    className: "bg-red-50 text-red-600",
  },
};

function formatRequestedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MatchCard({ match }: { match: PropertyMatchWithProperty }) {
  const pill = STATUS_PILL[match.status];
  const PillIcon = pill.icon;

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="bg-surface-soft text-muted-foreground flex size-16 shrink-0 items-center justify-center rounded-lg">
        <Home className="size-6" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-foreground line-clamp-1 text-base font-semibold">
          {match.property.title}
        </h3>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">{match.property.location}</span>
        </p>
        <p className="text-foreground text-sm font-medium">
          {formatCurrency(match.property.monthlyRent, "en-US", "THB")}
          <span className="text-muted-foreground font-normal"> / month</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Requested on {formatRequestedDate(match.createdAt)}
        </p>
        <Link
          href={`/explore/${match.propertyId}`}
          className="text-primary inline-block text-sm font-medium hover:underline"
        >
          View details
        </Link>
      </div>

      <Badge
        className={`h-fit shrink-0 gap-1.5 rounded-full px-3 py-1 font-medium ${pill.className}`}
      >
        <PillIcon className="size-3.5" />
        {pill.label}
      </Badge>
    </Card>
  );
}
