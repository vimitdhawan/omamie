"use client";

import { useState } from "react";
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

  const handleFormSuccess = (updatedProperty: Property) => {
    setProperty(updatedProperty);
  };

  const handleFormBack = (updatedProperty: Property) => {
    setProperty(updatedProperty);
  };

  return (
    <div className="bg-white px-4 pt-8 pb-12">
      {property.nextAction === PropertyNextAction.BASIC_DETAILS && (
        <BasicDetailsForm property={property} onSuccess={handleFormSuccess} />
      )}

      {property.nextAction === PropertyNextAction.AMENITIES && (
        <AmenitiesForm property={property} onSuccess={handleFormSuccess} />
      )}

      {property.nextAction === PropertyNextAction.REVIEW && (
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

      {property.nextAction === PropertyNextAction.COMPLETED && (
        <SuccessMessage property={property} />
      )}
    </div>
  );
}
