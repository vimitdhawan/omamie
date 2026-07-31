import { Label } from "@/components/ui/label";
import {
  FURNISHED_STATUS,
  AMENITIES,
  type FurnishedStatus,
  type Amenity,
} from "../schema";
import { cn } from "@/lib/utils";

interface StepAmenitiesProps {
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus;
  amenities: Amenity[];
  onBedroomsChange: (value: number) => void;
  onBathroomsChange: (value: number) => void;
  onFurnishedStatusChange: (status: FurnishedStatus) => void;
  onAmenitiesChange: (amenities: Amenity[]) => void;
}

const FURNISHED_ICONS: Record<FurnishedStatus, string> = {
  furnished: "chair",
  partial: "weekend",
  unfurnished: "square_foot",
};

const AMENITY_ICONS: Record<Amenity, string> = {
  ac: "ac_unit",
  microwave: "microwave",
  wifi: "wifi",
  pool: "pool",
  gym: "fitness_center",
  parking: "local_parking",
};

export function StepAmenities({
  bedrooms,
  bathrooms,
  furnishedStatus,
  amenities,
  onBedroomsChange,
  onBathroomsChange,
  onFurnishedStatusChange,
  onAmenitiesChange,
}: StepAmenitiesProps) {
  const handleAmenityToggle = (amenity: Amenity) => {
    if (amenities.includes(amenity)) {
      onAmenitiesChange(amenities.filter((a) => a !== amenity));
    } else {
      onAmenitiesChange([...amenities, amenity]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-on-surface text-xl font-semibold">
        Property Information
      </h2>

      {/* Bedrooms */}
      <div className="bg-surface-container-low hover:bg-surface-container flex items-center justify-between rounded-lg p-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="material-symbols-outlined text-[24px]">bed</span>
          </div>
          <div>
            <p className="text-on-surface font-semibold">Bedrooms</p>
            <p className="text-on-surface-variant text-sm">
              How many sleeping areas?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onBedroomsChange(Math.max(1, bedrooms - 1))}
            className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <input type="hidden" name="bedrooms" value={bedrooms} />
          <span className="w-8 text-center text-xl font-bold">{bedrooms}</span>
          <button
            type="button"
            onClick={() => onBedroomsChange(Math.min(20, bedrooms + 1))}
            className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* Bathrooms */}
      <div className="bg-surface-container-low hover:bg-surface-container flex items-center justify-between rounded-lg p-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="material-symbols-outlined text-[24px]">
              bathtub
            </span>
          </div>
          <div>
            <p className="text-on-surface font-semibold">Bathrooms</p>
            <p className="text-on-surface-variant text-sm">
              Full or half bathrooms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onBathroomsChange(Math.max(1, bathrooms - 1))}
            className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <input type="hidden" name="bathrooms" value={bathrooms} />
          <span className="w-8 text-center text-xl font-bold">{bathrooms}</span>
          <button
            type="button"
            onClick={() => onBathroomsChange(Math.min(20, bathrooms + 1))}
            className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* Furnishing Status */}
      <div className="space-y-4">
        <Label className="px-1">Furnishing Status</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(
            Object.entries(FURNISHED_STATUS) as [FurnishedStatus, string][]
          ).map(([status, label]) => (
            <div key={status} className="relative">
              <input
                type="radio"
                id={`furnished-${status}`}
                name="furnishedStatus"
                value={status}
                checked={furnishedStatus === status}
                onChange={() => onFurnishedStatusChange(status)}
                className="peer sr-only"
              />
              <label
                htmlFor={`furnished-${status}`}
                className={cn(
                  "flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                  "hover:bg-surface-container-high",
                  "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                )}
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    {FURNISHED_ICONS[status]}
                  </span>
                </div>
                <span className="text-sm font-semibold">{label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="px-1">Amenities</Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(Object.entries(AMENITIES) as [Amenity, string][]).map(
            ([amenity, label]) => (
              <div key={amenity} className="relative">
                <input
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  name="amenities"
                  value={amenity}
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className={cn(
                    "flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-all",
                    "hover:bg-surface-container-high",
                    "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                  )}
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      {AMENITY_ICONS[amenity]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
