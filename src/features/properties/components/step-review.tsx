import { formatCurrency } from "@/lib/utils/format";
import {
  PROPERTY_TYPES,
  FURNISHED_STATUS,
  AMENITIES,
  type PropertyType,
  type FurnishedStatus,
  type Amenity,
} from "../schema";

interface StepReviewProps {
  propertyType: PropertyType;
  title: string;
  location: string;
  monthlyRent: string;
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus;
  amenities: Amenity[];
  acceptTerms: boolean;
  confirmAccuracy: boolean;
  onAcceptTermsChange: (checked: boolean) => void;
  onConfirmAccuracyChange: (checked: boolean) => void;
}

export function StepReview({
  propertyType,
  title,
  location,
  monthlyRent,
  bedrooms,
  bathrooms,
  furnishedStatus,
  amenities,
  acceptTerms,
  confirmAccuracy,
  onAcceptTermsChange,
  onConfirmAccuracyChange,
}: StepReviewProps) {
  const rentAmount = parseFloat(monthlyRent) || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-on-surface text-xl font-semibold">
        Review & Publish
      </h2>

      {/* Review Summary */}
      <div className="space-y-4">
        <h3 className="text-on-surface text-lg font-semibold">
          Review Summary
        </h3>
        <div className="bg-surface-container-low grid grid-cols-1 gap-6 rounded-lg p-4 md:grid-cols-2">
          {/* Listing Details */}
          <div className="space-y-2">
            <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
              Listing Details
            </p>
            <p className="text-on-surface font-semibold">
              {title || "Untitled Property"}
            </p>
            <p className="text-on-surface-variant text-sm">
              {formatCurrency(rentAmount, "en-US", "THB")} / Month •{" "}
              {FURNISHED_STATUS[furnishedStatus]}
            </p>
            <div className="mt-4 space-y-1">
              <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[18px]">
                  bed
                </span>
                <span>
                  {bedrooms} Bedroom{bedrooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[18px]">
                  bathtub
                </span>
                <span>
                  {bathrooms} Bathroom{bathrooms !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[18px]">
                  {propertyType === "apartment" && "apartment"}
                  {propertyType === "condo" && "domain"}
                  {propertyType === "house" && "home"}
                  {propertyType === "townhouse" && "holiday_village"}
                </span>
                <span>{PROPERTY_TYPES[propertyType]}</span>
              </div>
              {amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-surface-container-highest text-on-surface-variant rounded px-2 py-1 text-xs font-semibold tracking-wider uppercase"
                    >
                      {AMENITIES[amenity]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
              Location
            </p>
            <p className="text-on-surface font-semibold">
              {location || "Not specified"}
            </p>
            <p className="text-on-surface-variant text-sm">
              Pending Verification
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-4 pt-4">
        <h4 className="text-on-surface font-semibold">Terms & Conditions</h4>
        <div className="space-y-3">
          <label className="group flex cursor-pointer items-start gap-3">
            <div className="relative flex items-center pt-1">
              <input
                type="checkbox"
                name="acceptTerms"
                value="true"
                checked={acceptTerms}
                onChange={(e) => onAcceptTermsChange(e.target.checked)}
                className="border-outline-variant text-primary focus:ring-primary h-5 w-5 rounded transition-all"
                required
              />
              <div className="bg-primary/10 pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="text-on-surface-variant text-sm leading-relaxed">
              I agree to Omamie&apos;s{" "}
              <a href="#" className="text-primary underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <label className="group flex cursor-pointer items-start gap-3">
            <div className="relative flex items-center pt-1">
              <input
                type="checkbox"
                name="confirmAccuracy"
                value="true"
                checked={confirmAccuracy}
                onChange={(e) => onConfirmAccuracyChange(e.target.checked)}
                className="border-outline-variant text-primary focus:ring-primary h-5 w-5 rounded transition-all"
                required
              />
              <div className="bg-primary/10 pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="text-on-surface-variant text-sm leading-relaxed">
              I confirm that the information provided is accurate and I have the
              authority to list this property.
            </span>
          </label>
        </div>
        <p className="text-on-surface-variant/70 text-sm italic">
          Our team will review your submission within 24 hours.
        </p>
      </div>
    </div>
  );
}
