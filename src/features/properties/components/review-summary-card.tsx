"use client";

import type { ListPropertyFormData } from "@/features/properties/schema";

interface ReviewSummaryCardProps {
  formData: ListPropertyFormData;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
};

const FURNISHING_LABELS: Record<string, string> = {
  fully: "Fully Furnished",
  partial: "Partially Furnished",
  none: "Unfurnished",
};

const AMENITY_LABELS: Record<string, string> = {
  air_conditioning: "Air Conditioning",
  wifi: "WiFi",
  parking: "Parking",
  balcony: "Balcony",
  washing_machine: "Washing Machine",
  refrigerator: "Refrigerator",
  microwave: "Microwave",
  tv: "TV",
  gym_access: "Gym Access",
  pool_access: "Pool Access",
  security: "Security",
  pet_friendly: "Pet Friendly",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function ReviewSummaryCard({ formData }: ReviewSummaryCardProps) {
  const listingRole = formData.listingRole === "owner" ? "Owner" : "Agent";
  const propertyType =
    PROPERTY_TYPE_LABELS[formData.propertyType] || formData.propertyType;
  const furnishing =
    FURNISHING_LABELS[formData.furnishing] || formData.furnishing;

  return (
    <div className="border-hairline mt-6 border-t pt-6">
      <h4 className="text-title-md mb-4 font-medium">Review Your Listing</h4>

      {/* Property Details Card */}
      <div className="bg-surface-soft mb-4 space-y-3 rounded-xl p-4">
        <h5 className="text-title-sm font-medium">Property Details</h5>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Listing As</dt>
            <dd className="text-ink font-medium">{listingRole}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Property Type</dt>
            <dd className="text-ink font-medium">{propertyType}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Location</dt>
            <dd className="text-ink max-w-[120px] truncate font-medium">
              {formData.location || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Monthly Rent</dt>
            <dd className="text-ink font-medium">
              {formatCurrency(formData.rentAmount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Bedrooms</dt>
            <dd className="text-ink font-medium">{formData.bedrooms}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Bathrooms</dt>
            <dd className="text-ink font-medium">{formData.bathrooms}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Furnishing</dt>
            <dd className="text-ink font-medium">{furnishing}</dd>
          </div>
        </dl>
      </div>

      {/* Amenities Card */}
      {formData.amenities.length > 0 && (
        <div className="bg-surface-soft mb-4 space-y-3 rounded-xl p-4">
          <h5 className="text-title-sm font-medium">Amenities</h5>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity) => (
              <span
                key={amenity}
                className="text-caption-sm border-hairline text-ink rounded-full border bg-white px-2.5 py-1 font-medium"
              >
                {AMENITY_LABELS[amenity] || amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info Card */}
      <div className="bg-surface-soft space-y-3 rounded-xl p-4">
        <h5 className="text-title-sm font-medium">Contact Information</h5>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-ink font-medium">
              {formData.contactName || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-ink max-w-[120px] truncate font-medium">
              {formData.contactEmail || "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-ink font-medium">
              {formData.contactPhone || "—"}
            </dd>
          </div>
        </dl>
      </div>

      <p className="text-muted-foreground mt-4 text-sm">
        By submitting, you confirm that the information provided is accurate and
        you authorize Omamie to list this property.
      </p>
    </div>
  );
}
