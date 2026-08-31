"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ViewingRequestCard } from "@/features/viewing-requests/components/viewing-request-card";
import {
  getMyViewingRequestsAction,
  confirmViewingRequestAction,
} from "@/features/viewing-requests/actions";
import type { ViewingRequestWithProperty } from "@/features/viewing-requests/types";
import { toast } from "sonner";

export default function MatchesPage() {
  const [matches, setMatches] = useState<ViewingRequestWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    setLoading(true);
    const result = await getMyViewingRequestsAction();
    if (result.success) {
      // Matches are requests that have been accepted or confirmed
      const matched = result.data.filter(
        (r) => r.status === "accepted" || r.status === "confirmed"
      );
      setMatches(matched);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMatches();
  }, []);

  const handleConfirm = async (requestId: string) => {
    const result = await confirmViewingRequestAction(requestId);
    if (result.success) {
      toast.success("Viewing confirmed! The owner has been notified.");
      loadMatches();
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-screen-lg px-4 md:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="mt-2 text-gray-600">
            Properties where owners have accepted your viewing request
          </p>
        </header>

        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((request) => (
              <ViewingRequestCard
                key={request.id}
                request={request}
                onConfirm={handleConfirm}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No matches yet
            </h3>
            <p className="text-gray-600">
              When property owners accept your viewing requests, they&apos;ll
              appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
