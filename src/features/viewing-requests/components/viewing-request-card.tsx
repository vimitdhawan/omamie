import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { ViewingRequestWithProperty } from "../types";

interface ViewingRequestCardProps {
  request: ViewingRequestWithProperty;
  onCancel?: (requestId: string) => void;
  onConfirm?: (requestId: string) => void;
  showActions?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: "Waiting for owner",
    variant: "secondary" as const,
  },
  accepted: {
    label: "Viewing Scheduled",
    variant: "default" as const,
  },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
  },
  rejected: {
    label: "Declined",
    variant: "destructive" as const,
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline" as const,
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
  },
};

export function ViewingRequestCard({
  request,
  onCancel,
  onConfirm,
  showActions = true,
}: ViewingRequestCardProps) {
  const property = request.property;
  const statusConfig = STATUS_CONFIG[request.status];

  const placeholderImage = property
    ? `https://placehold.co/192x128/e2e8f0/475569?text=${encodeURIComponent(property.title)}`
    : "https://placehold.co/192x128/e2e8f0/475569?text=Property";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {/* Property Image */}
        <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
          <img
            src={placeholderImage}
            alt={property?.title || "Property"}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h3 className="line-clamp-1 font-semibold text-gray-900">
                {property?.title || "Property"}
              </h3>
              <Badge variant={statusConfig.variant} className="ml-2 shrink-0">
                {statusConfig.label}
              </Badge>
            </div>

            {property && (
              <>
                <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {property.location}
                </p>
                <p className="font-semibold text-gray-900">
                  ${property.monthlyRent.toLocaleString()}/month
                </p>
              </>
            )}

            {/* Proposed Viewing Time */}
            {request.status === "accepted" && request.proposedDate && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3">
                <p className="mb-1 text-xs font-medium text-blue-900">
                  Proposed Viewing Time:
                </p>
                <div className="flex items-center gap-3 text-sm text-blue-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(request.proposedDate).toLocaleDateString()}
                  </span>
                  {request.proposedTimeStart && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {request.proposedTimeStart}
                      {request.proposedTimeEnd &&
                        ` - ${request.proposedTimeEnd}`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Requested on {new Date(request.requestedAt).toLocaleDateString()}
            </p>
            {showActions && (
              <div className="flex gap-2">
                {request.status === "pending" && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(request.id)}
                  >
                    Cancel
                  </Button>
                )}
                {request.status === "accepted" && onConfirm && (
                  <Button size="sm" onClick={() => onConfirm(request.id)}>
                    Confirm
                  </Button>
                )}
                {property && (
                  <a href={`/browse-properties/${property.id}`}>
                    <Button variant="ghost" size="sm">
                      View Property
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
