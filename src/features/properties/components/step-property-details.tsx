import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROPERTY_TYPES, type PropertyType } from "../schema";
import { cn } from "@/lib/utils";

interface StepPropertyDetailsProps {
  propertyType: PropertyType;
  title: string;
  location: string;
  monthlyRent: string;
  description: string;
  onPropertyTypeChange: (type: PropertyType) => void;
  onTitleChange: (title: string) => void;
  onLocationChange: (location: string) => void;
  onMonthlyRentChange: (rent: string) => void;
  onDescriptionChange: (desc: string) => void;
  errors?: Record<string, string>;
}

const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  apartment: "apartment",
  condo: "domain",
  house: "home",
  townhouse: "holiday_village",
};

export function StepPropertyDetails({
  propertyType,
  title,
  location,
  monthlyRent,
  description,
  onPropertyTypeChange,
  onTitleChange,
  onLocationChange,
  onMonthlyRentChange,
  onDescriptionChange,
  errors = {},
}: StepPropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-on-surface text-xl font-semibold">
        Property Details
      </h2>

      {/* Property Type */}
      <div>
        <Label className="mb-4 block">Property Type</Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.entries(PROPERTY_TYPES) as [PropertyType, string][]).map(
            ([type, label]) => (
              <label key={type} className="group cursor-pointer">
                <input
                  type="radio"
                  name="propertyType"
                  value={type}
                  checked={propertyType === type}
                  onChange={() => onPropertyTypeChange(type)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                    "hover:border-primary",
                    "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                  )}
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      {PROPERTY_TYPE_ICONS[type]}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </label>
            )
          )}
        </div>
      </div>

      {/* Property Title */}
      <div>
        <Label htmlFor="title" className="mb-2">
          Property Title <span className="text-error">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="e.g., Luxury 2BR Apartment in Sukhumvit"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className={cn(
            errors.title &&
              "border-error focus:border-error focus:ring-error/20"
          )}
        />
        {errors.title && (
          <p className="text-error mt-1 text-sm">{errors.title}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="mb-2">
          Property Location <span className="text-error">*</span>
        </Label>
        <div className="relative">
          <div className="text-on-surface-variant pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <Input
            id="location"
            name="location"
            type="text"
            className={cn(
              "pl-12",
              errors.location &&
                "border-error focus:border-error focus:ring-error/20"
            )}
            placeholder="Search area, landmark or neighborhood"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            required
          />
        </div>
        {errors.location && (
          <p className="text-error mt-1 text-sm">{errors.location}</p>
        )}
      </div>

      {/* Monthly Rent */}
      <div className="md:w-1/2">
        <Label htmlFor="monthlyRent" className="mb-2">
          Monthly Rent (THB) <span className="text-error">*</span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-on-surface-variant font-bold">฿</span>
          </div>
          <Input
            id="monthlyRent"
            name="monthlyRent"
            type="number"
            className={cn(
              "pl-10",
              errors.monthlyRent &&
                "border-error focus:border-error focus:ring-error/20"
            )}
            placeholder="0"
            value={monthlyRent}
            onChange={(e) => onMonthlyRentChange(e.target.value)}
            required
            min="0"
            step="1"
          />
        </div>
        {errors.monthlyRent && (
          <p className="text-error mt-1 text-sm">{errors.monthlyRent}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="mb-2">
          Property Description
        </Label>
        <textarea
          id="description"
          name="description"
          className="border-outline-variant bg-surface-container-lowest placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-primary/20 h-[120px] w-full resize-none rounded-lg border p-4 transition-all outline-none focus:ring-2"
          placeholder="Tell potential tenants what makes your property special (amenities, neighborhood, unique features)..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
