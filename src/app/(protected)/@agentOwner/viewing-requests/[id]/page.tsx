import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { getViewingRequest } from "@/features/viewing-requests/service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewingRequestActions } from "@/features/viewing-requests/components/ViewingRequestActions";

/**
 * Get badge variant for status
 */
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "pending":
      return "default";
    case "accepted":
      return "secondary";
    case "completed":
      return "outline";
    case "declined":
      return "destructive";
    case "cancelled":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Format date to full format (Monday, 15 Sep 2026)
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format time to 24-hour format (14:00)
 */
function formatTime(timeString: string): string {
  return timeString.slice(0, 5); // HH:MM
}

/**
 * Format datetime to international format with time
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function ViewingRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const { id } = await params;

  let request;
  try {
    request = await getViewingRequest(id, session.profileId);
  } catch {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/viewing-requests"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to Viewing Requests
          </Link>
          <h1 className="text-foreground text-[28px] font-bold">
            Viewing Request Details
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(request.status)}>
              {request.status}
            </Badge>
            <span className="text-muted-foreground text-sm">
              Created {formatDateTime(request.createdAt)}
            </span>
          </div>
        </div>
        <ViewingRequestActions
          requestId={request.id}
          currentStatus={request.status}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-symbols-outlined">home</span>
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Property</p>
              <Link
                href={`/properties/${request.property.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {request.property.title}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Location</p>
              <p className="font-medium">{request.property.location}</p>
            </div>
          </CardContent>
        </Card>

        {/* Requester Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-symbols-outlined">person</span>
              Requester Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Name</p>
              <p className="font-medium">{request.requesterName}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Email</p>
              <a
                href={`mailto:${request.requesterEmail}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {request.requesterEmail}
              </a>
            </div>
            {request.requesterPhone && (
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Phone</p>
                <a
                  href={`tel:${request.requesterPhone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {request.requesterPhone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viewing Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-symbols-outlined">event</span>
              Viewing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Requested Date
              </p>
              <p className="font-medium">
                {formatFullDate(request.requestedDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Requested Time
              </p>
              <p className="font-medium">
                {formatTime(request.requestedTimeStart)} -{" "}
                {formatTime(request.requestedTimeEnd)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-symbols-outlined">note</span>
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request.notes ? (
              <p className="whitespace-pre-wrap">{request.notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-sm">add</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Request Created</p>
              <p className="text-muted-foreground text-sm">
                {formatDateTime(request.createdAt)}
              </p>
            </div>
          </div>
          {request.updatedAt !== request.createdAt && (
            <div className="flex items-start gap-4">
              <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-sm">edit</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground text-sm">
                  {formatDateTime(request.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
