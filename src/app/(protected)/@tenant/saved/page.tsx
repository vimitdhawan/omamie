"use client";

import { useState, useEffect } from "react";
import { PropertyGrid } from "@/features/properties/components/property-grid";
import { getMySavedPropertiesAction } from "@/features/saved-properties/actions";
import { searchPropertiesAction } from "@/features/properties/actions";
import { toggleSavePropertyAction } from "@/features/saved-properties/actions";
import type { Property } from "@/features/properties/types";
import { toast } from "sonner";

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedProperties = async () => {
    setLoading(true);

    // Get saved property IDs
    const savedResult = await getMySavedPropertiesAction();
    if (savedResult.success) {
      const propertyIds = savedResult.data.map((sp) => sp.propertyId);
      setSavedPropertyIds(propertyIds);

      // Fetch the actual properties
      // For now, we'll search all and filter - in production, add a proper endpoint
      const propertiesResult = await searchPropertiesAction({});
      if (propertiesResult.success) {
        const saved = propertiesResult.data.filter((p) =>
          propertyIds.includes(p.id)
        );
        setProperties(saved);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSavedProperties();
  }, []);

  const handleSaveToggle = async (propertyId: string) => {
    const result = await toggleSavePropertyAction(propertyId);
    if (result.success) {
      toast.success(result.data.message);
      // Reload to update the list
      loadSavedProperties();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
          <p className="mt-2 text-gray-600">
            Properties you&apos;ve bookmarked for later
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <PropertyGrid
            properties={properties}
            savedPropertyIds={savedPropertyIds}
            onSaveToggle={handleSaveToggle}
          />
        )}
      </div>
    </div>
  );
}
