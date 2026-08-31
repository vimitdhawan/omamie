import type { Property } from "../types";
import { PropertyCard } from "./property-card";

interface PropertyGridProps {
  properties: Property[];
  savedPropertyIds?: string[];
  requestedPropertyIds?: string[];
  onSaveToggle?: (propertyId: string) => void;
  onInterestClick?: (propertyId: string) => void;
}

export function PropertyGrid({
  properties,
  savedPropertyIds = [],
  requestedPropertyIds = [],
  onSaveToggle,
  onInterestClick,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            No properties found
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Try adjusting your search filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isSaved={savedPropertyIds.includes(property.id)}
          hasRequested={requestedPropertyIds.includes(property.id)}
          onSaveToggle={onSaveToggle}
          onInterestClick={onInterestClick}
        />
      ))}
    </div>
  );
}
