"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewingRequestsTable } from "@/features/viewing-requests/components/ViewingRequestsTable";
import type {
  ViewingRequestWithProperty,
  ViewingRequestCounts,
} from "@/features/viewing-requests/types";
import { getViewingRequestsAction } from "@/features/viewing-requests/actions";

interface ViewingRequestsClientProps {
  initialRequests: ViewingRequestWithProperty[];
  initialCounts: ViewingRequestCounts;
  initialStatus?: string;
  initialSearch?: string;
}

export function ViewingRequestsClient({
  initialRequests,
  initialCounts,
  initialStatus,
  initialSearch,
}: ViewingRequestsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [requests, setRequests] =
    useState<ViewingRequestWithProperty[]>(initialRequests);
  const [search, setSearch] = useState(initialSearch || "");
  const [activeTab, setActiveTab] = useState<string>(initialStatus || "all");

  // For display only - will be updated on next page load
  const counts = initialCounts;

  // Update URL when filters change
  const updateFilters = (newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus && newStatus !== "all") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    router.push(`/viewing-requests?${params.toString()}`);
  };

  // Fetch requests based on filters
  const fetchRequests = async (status?: string, searchQuery?: string) => {
    startTransition(async () => {
      const newRequests = await getViewingRequestsAction({
        status: status !== "all" ? status : undefined,
        search: searchQuery,
      });
      setRequests(newRequests);
    });
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateFilters(value, search);
    fetchRequests(value, search);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters(activeTab, search);
      fetchRequests(activeTab, search);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Refresh data after status change
  const handleStatusChange = () => {
    fetchRequests(activeTab, search);
  };

  return (
    <>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({counts.accepted})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined ({counts.declined})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({counts.cancelled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
          search
        </span>
        <Input
          type="text"
          placeholder="Search name, email, or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <ViewingRequestsTable
        requests={requests}
        onStatusChange={handleStatusChange}
      />

      {isPending && (
        <div className="flex items-center justify-center py-4">
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      )}
    </>
  );
}
