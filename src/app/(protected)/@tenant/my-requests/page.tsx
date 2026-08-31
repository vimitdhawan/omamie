"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ViewingRequestCard } from "@/features/viewing-requests/components/viewing-request-card";
import {
  getMyViewingRequestsAction,
  cancelViewingRequestAction,
  confirmViewingRequestAction,
} from "@/features/viewing-requests/actions";
import type { ViewingRequestWithProperty } from "@/features/viewing-requests/types";
import { toast } from "sonner";
import Link from "next/link";
import { Search } from "lucide-react";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ViewingRequestWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const result = await getMyViewingRequestsAction();
    if (result.success) {
      setRequests(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests();
  }, []);

  const handleCancel = async (requestId: string) => {
    const result = await cancelViewingRequestAction(requestId);
    if (result.success) {
      toast.success("Viewing request cancelled");
      loadRequests();
    } else {
      toast.error(result.error);
    }
  };

  const handleConfirm = async (requestId: string) => {
    const result = await confirmViewingRequestAction(requestId);
    if (result.success) {
      toast.success("Viewing confirmed! The owner has been notified.");
      loadRequests();
    } else {
      toast.error(result.error);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const matchedRequests = requests.filter(
    (r) => r.status === "accepted" || r.status === "confirmed"
  );
  const completedRequests = requests.filter(
    (r) =>
      r.status === "completed" ||
      r.status === "rejected" ||
      r.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-2 text-gray-600">
            Track properties you&apos;re interested in
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="interest" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interest">
                  Property Interest ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="matches">
                  Matches ({matchedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interest" className="mt-6 space-y-4">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <ViewingRequestCard
                      key={request.id}
                      request={request}
                      onCancel={handleCancel}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-gray-600">No pending viewing requests</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="matches" className="mt-6 space-y-4">
                {matchedRequests.length > 0 ? (
                  matchedRequests.map((request) => (
                    <ViewingRequestCard
                      key={request.id}
                      request={request}
                      onConfirm={handleConfirm}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-gray-600">No matched properties yet</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6 space-y-4">
                {completedRequests.length > 0 ? (
                  completedRequests.map((request) => (
                    <ViewingRequestCard
                      key={request.id}
                      request={request}
                      showActions={false}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-gray-600">No completed requests</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Rail CTA */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Can&apos;t find the perfect place?
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Tell us exactly what you&apos;re looking for, and we&apos;ll
                notify you when matching properties become available.
              </p>
              <Link href="/find-property" className="w-full">
                <Button className="w-full">Create Search Request</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
