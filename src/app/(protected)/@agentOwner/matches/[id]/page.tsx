import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMatchById } from "@/features/property-matches/repository";
import { MatchActions } from "@/features/property-matches/components/match-actions";
import { MapPin, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  const { id } = await params;
  const match = await getMatchById(id, session.profileId);

  if (!match) {
    redirect("/matches");
  }

  const statusLabel =
    match.status.charAt(0).toUpperCase() + match.status.slice(1);
  const statusColor =
    match.status === "interested"
      ? "secondary"
      : match.status === "approved"
        ? "default"
        : "destructive";

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center gap-3">
        <Link href="/matches">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-bold">{match.property.title}</h1>
          <p className="text-muted-foreground mt-1">
            Match Status: {statusLabel}
          </p>
        </div>
        <div className="ml-auto">
          <MatchActions matchId={match.id} currentStatus={match.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-[20px] font-bold">Property Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Title</p>
                <p className="mt-1 text-lg font-semibold">
                  {match.property.title}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="text-muted-foreground size-4" />
                <span>{match.property.location}</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Monthly Rent</p>
                <p className="mt-1 text-2xl font-bold">
                  ₹{match.property.monthlyRent.toLocaleString()}/mo
                </p>
              </div>
            </div>
          </div>

          {match.notes && (
            <div className="rounded-lg border p-6">
              <h3 className="mb-3 text-[20px] font-bold">Notes</h3>
              <p className="text-muted-foreground">{match.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4 rounded-lg border p-6">
            <div>
              <p className="text-muted-foreground text-sm">Status</p>
              <Badge
                variant={
                  statusColor as
                    "default" | "secondary" | "destructive" | "outline"
                }
                className="mt-2"
              >
                {statusLabel}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Created</p>
              <p className="mt-1 text-sm">
                {new Date(match.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Last Updated</p>
              <p className="mt-1 text-sm">
                {new Date(match.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Initiated By</p>
              <p className="mt-1 text-sm capitalize">{match.initiatedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
