"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyGrid } from "@/features/properties/components/property-grid";
import { PropertyFilters } from "@/features/properties/components/property-filters";
import { PropertySearchBar } from "@/features/properties/components/property-search-bar";
import { ViewingRequestDialog } from "@/features/viewing-requests/components/viewing-request-dialog";
import { searchPropertiesAction } from "@/features/properties/actions";
import { toggleSavePropertyAction } from "@/features/saved-properties/actions";
import type {
  Property,
  PropertySearchFilters,
} from "@/features/properties/types";
import { toast } from "sonner";

export default function BrowsePropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    location: searchParams.get("location") || undefined,
  });
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [requestedPropertyIds, setRequestedPropertyIds] = useState<string[]>(
    []
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const loadProperties = async () => {
    setLoading(true);
    const result = await searchPropertiesAction(filters);
    if (result.success) {
      setProperties(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (location: string) => {
    const newFilters = { ...filters, location: location || undefined };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    router.push(`/browse-properties?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: PropertySearchFilters) => {
    setFilters(newFilters);
  };

  const handleSaveToggle = async (propertyId: string) => {
    const result = await toggleSavePropertyAction(propertyId);
    if (result.success) {
      if (result.data.isSaved) {
        setSavedPropertyIds([...savedPropertyIds, propertyId]);
      } else {
        setSavedPropertyIds(savedPropertyIds.filter((id) => id !== propertyId));
      }
      toast.success(result.data.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleInterestClick = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setDialogOpen(true);
    }
  };

  const handleRequestSuccess = () => {
    if (selectedProperty) {
      setRequestedPropertyIds([...requestedPropertyIds, selectedProperty.id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-screen-2xl px-4 md:px-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Find your next home
            </h1>
            <PropertySearchBar
              initialLocation={filters.location}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Filters Sidebar */}
          <PropertyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Properties Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `${properties.length} properties found`}
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-gray-600">Loading properties...</div>
              </div>
            ) : (
              <PropertyGrid
                properties={properties}
                savedPropertyIds={savedPropertyIds}
                requestedPropertyIds={requestedPropertyIds}
                onSaveToggle={handleSaveToggle}
                onInterestClick={handleInterestClick}
              />
            )}
          </div>
        </div>
      </section>

      {/* Viewing Request Dialog */}
      {selectedProperty && (
        <ViewingRequestDialog
          propertyId={selectedProperty.id}
          propertyTitle={selectedProperty.title}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}
