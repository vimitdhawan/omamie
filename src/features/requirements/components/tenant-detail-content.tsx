import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";
import {
  PROPERTY_TYPES,
  BEDROOMS_LABELS,
  BATHROOMS_LABELS,
  FURNISHING_LABELS,
  LEASE_LENGTH_LABELS,
  INTENDED_DURATION_LABELS,
} from "../schema";
import type { TenantRequestDetail } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Owner-facing view of a tenant's profile + requirements for a single match request.
 * Never receives or renders an email — the caller (getMatchTenantDetailAction) can only
 * return `TenantRequestDetail`, which has no such field. */
export function TenantDetailContent({
  detail,
}: {
  detail: TenantRequestDetail;
}) {
  const { profile, requirements } = detail;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          About
        </h3>
        {profile ? (
          <div className="space-y-2 text-sm">
            <p className="text-foreground text-base font-semibold">
              {profile.firstName}
            </p>
            <p>
              <span className="text-muted-foreground">Occupation: </span>
              {profile.occupation}
              {profile.employer ? ` at ${profile.employer}` : ""}
            </p>
            <p>
              <span className="text-muted-foreground">Why moving: </span>
              {profile.reasonForMoving}
            </p>
            <p>
              <span className="text-muted-foreground">Intends to stay: </span>
              {INTENDED_DURATION_LABELS[profile.intendedDuration]}
            </p>
            <p>
              <span className="text-muted-foreground">Occupants: </span>
              {profile.numberOfOccupants}
            </p>
            <div className="flex gap-2 pt-1">
              {profile.hasPets && <Badge variant="secondary">Has pets</Badge>}
              {profile.isSmoker && <Badge variant="secondary">Smoker</Badge>}
            </div>
            {profile.bio && (
              <p className="text-muted-foreground pt-1 italic">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            This tenant hasn&apos;t shared their details yet.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Requirements
        </h3>
        {requirements ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Looking for: </span>
              {PROPERTY_TYPES[requirements.propertyType]} ·{" "}
              {BEDROOMS_LABELS[requirements.bedrooms]} ·{" "}
              {BATHROOMS_LABELS[requirements.bathrooms]}
            </p>
            <p>
              <span className="text-muted-foreground">Location: </span>
              {requirements.preferredLocation}
            </p>
            <p>
              <span className="text-muted-foreground">Budget: </span>
              Up to {formatCurrency(requirements.monthlyBudget, "en-US", "THB")}
              /month
            </p>
            <p>
              <span className="text-muted-foreground">Move-in from: </span>
              {formatDate(requirements.moveInDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Furnishing: </span>
              {FURNISHING_LABELS[requirements.furnishing]}
            </p>
            {requirements.preferredLeaseLength && (
              <p>
                <span className="text-muted-foreground">Lease length: </span>
                {LEASE_LENGTH_LABELS[requirements.preferredLeaseLength]}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              {requirements.petFriendly && (
                <Badge variant="secondary">Needs pet-friendly</Badge>
              )}
              {requirements.parkingNeeded && (
                <Badge variant="secondary">Needs parking</Badge>
              )}
            </div>
            {requirements.additionalNotes && (
              <p className="text-muted-foreground pt-1 italic">
                &ldquo;{requirements.additionalNotes}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            This tenant hasn&apos;t shared their requirements yet.
          </p>
        )}
      </section>
    </div>
  );
}
