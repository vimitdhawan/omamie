import type { ReactNode } from "react";
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

function InfoRow({
  label,
  children,
  emphasize = false,
}: {
  label: string;
  children: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={
          emphasize
            ? "text-foreground text-right font-semibold"
            : "text-foreground text-right"
        }
      >
        {children}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
      {children}
    </h3>
  );
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
      <section className="space-y-4">
        <SectionLabel>About</SectionLabel>
        {profile ? (
          <>
            <div className="flex items-center gap-3">
              <div className="bg-foreground text-background flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {profile.firstName.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-foreground text-base font-semibold">
                {profile.firstName}
              </p>
            </div>

            <div className="space-y-1.5">
              <InfoRow label="Occupation">{profile.occupation}</InfoRow>
              <InfoRow label="Employer">{profile.employer || "—"}</InfoRow>
              <InfoRow label="Why moving">{profile.reasonForMoving}</InfoRow>
              <InfoRow label="Intends to stay">
                {INTENDED_DURATION_LABELS[profile.intendedDuration]}
              </InfoRow>
              <InfoRow label="Occupants">{profile.numberOfOccupants}</InfoRow>
            </div>

            {(profile.hasPets || profile.isSmoker) && (
              <div className="flex gap-2">
                {profile.hasPets && <Badge variant="secondary">Has pets</Badge>}
                {profile.isSmoker && <Badge variant="secondary">Smoker</Badge>}
              </div>
            )}

            {profile.bio && (
              <div className="bg-muted/50 rounded-lg border p-3">
                <p className="text-muted-foreground text-sm italic">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            This tenant hasn&apos;t shared their details yet.
          </p>
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionLabel>Requirements</SectionLabel>
        {requirements ? (
          <>
            <div className="space-y-1.5">
              <InfoRow label="Looking for">
                {PROPERTY_TYPES[requirements.propertyType]}
              </InfoRow>
              <InfoRow label="Property">
                {BEDROOMS_LABELS[requirements.bedrooms]} ·{" "}
                {BATHROOMS_LABELS[requirements.bathrooms]}
              </InfoRow>
              <InfoRow label="Location">
                {requirements.preferredLocation}
              </InfoRow>
              <InfoRow label="Budget" emphasize>
                Up to{" "}
                {formatCurrency(requirements.monthlyBudget, "en-US", "THB")}
                /month
              </InfoRow>
              <InfoRow label="Move-in from">
                {formatDate(requirements.moveInDate)}
              </InfoRow>
              <InfoRow label="Furnishing">
                {FURNISHING_LABELS[requirements.furnishing]}
              </InfoRow>
              {requirements.preferredLeaseLength && (
                <InfoRow label="Lease length">
                  {LEASE_LENGTH_LABELS[requirements.preferredLeaseLength]}
                </InfoRow>
              )}
            </div>

            {(requirements.petFriendly || requirements.parkingNeeded) && (
              <div className="flex flex-wrap gap-2">
                {requirements.petFriendly && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700"
                  >
                    Needs pet-friendly unit
                  </Badge>
                )}
                {requirements.parkingNeeded && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700"
                  >
                    Needs parking
                  </Badge>
                )}
              </div>
            )}

            {requirements.additionalNotes && (
              <p className="text-muted-foreground text-sm italic">
                &ldquo;{requirements.additionalNotes}&rdquo;
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            This tenant hasn&apos;t shared their requirements yet.
          </p>
        )}
      </section>
    </div>
  );
}
