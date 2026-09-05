"use client";

import { useState, useMemo } from "react";
import { BasicDetailsForm } from "./basic-info-form";
import { AmenitiesForm } from "./amenities-form";
import { ReviewForm } from "./review-form";
import { SuccessMessage } from "./success-message";
import type { Property } from "../types";
import { PropertyNextAction } from "../types";

interface PropertyEditClientProps {
  property: Property;
}

export function PropertyEditClient({
  property: initialProperty,
}: PropertyEditClientProps) {
  const [property, setProperty] = useState<Property>(initialProperty);
  const [hasUpdated, setHasUpdated] = useState(false);

  // Compute resolved next action: on first load, if property is already completed,
  // restart wizard at basic details. Once any step is submitted in this session
  // (hasUpdated = true), always trust the current nextAction state.
  const resolvedNextAction = useMemo(
    () =>
      !hasUpdated && property.nextAction === PropertyNextAction.COMPLETED
        ? PropertyNextAction.BASIC_DETAILS
        : property.nextAction,
    [hasUpdated, property.nextAction]
  );

  const handleFormSuccess = (updatedProperty: Property) => {
    setHasUpdated(true);
    setProperty(updatedProperty);
  };

  const handleFormBack = (updatedProperty: Property) => {
    setHasUpdated(true);
    setProperty(updatedProperty);
  };

  return (
    <main className="min-h-screen bg-white px-4 pt-8 pb-12">
      {resolvedNextAction === PropertyNextAction.BASIC_DETAILS && (
        <BasicDetailsForm property={property} onSuccess={handleFormSuccess} />
      )}

      {resolvedNextAction === PropertyNextAction.AMENITIES && (
        <AmenitiesForm property={property} onSuccess={handleFormSuccess} />
      )}

      {resolvedNextAction === PropertyNextAction.REVIEW && (
        <ReviewForm
          property={property}
          onSuccess={handleFormSuccess}
          onBack={() =>
            handleFormBack({
              ...property,
              nextAction: PropertyNextAction.AMENITIES,
            })
          }
        />
      )}

      {resolvedNextAction === PropertyNextAction.COMPLETED && (
        <SuccessMessage property={property} />
      )}
    </main>
  );
}
