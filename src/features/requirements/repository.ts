import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/types";
import type {
  TenantProfile,
  TenantRequirements,
  UpsertTenantProfileInput,
  UpsertTenantRequirementsInput,
  PropertyType,
  Bedrooms,
  Bathrooms,
  Furnishing,
  LeaseLength,
  IntendedDuration,
} from "./types";
import { AppError } from "@/lib/errors";

/**
 * Repository layer for tenant profile + requirements.
 * Direct database operations only - mapping between domain and table models.
 */

type TenantProfileTable = Tables<"tenant_profile">;
type TenantProfileInsertTable = TablesInsert<"tenant_profile">;
type TenantRequirementsTable = Tables<"tenant_requirements">;
type TenantRequirementsInsertTable = TablesInsert<"tenant_requirements">;

function mapProfileInputToRow(
  input: UpsertTenantProfileInput
): TenantProfileInsertTable {
  return {
    profile_id: input.profileId,
    first_name: input.firstName,
    occupation: input.occupation,
    employer: input.employer,
    reason_for_moving: input.reasonForMoving,
    intended_duration: input.intendedDuration,
    number_of_occupants: input.numberOfOccupants,
    has_pets: input.hasPets,
    is_smoker: input.isSmoker,
    bio: input.bio,
  };
}

function mapRowToProfile(row: TenantProfileTable): TenantProfile {
  return {
    profileId: row.profile_id,
    firstName: row.first_name,
    occupation: row.occupation,
    employer: row.employer,
    reasonForMoving: row.reason_for_moving,
    intendedDuration: row.intended_duration as IntendedDuration,
    numberOfOccupants: row.number_of_occupants,
    hasPets: row.has_pets,
    isSmoker: row.is_smoker,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRequirementsInputToRow(
  input: UpsertTenantRequirementsInput
): TenantRequirementsInsertTable {
  return {
    profile_id: input.profileId,
    property_type: input.propertyType,
    preferred_location: input.preferredLocation,
    monthly_budget: input.monthlyBudget,
    move_in_date: input.moveInDate,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    min_size_sqm: input.minSizeSqm,
    furnishing: input.furnishing,
    preferred_neighborhoods: input.preferredNeighborhoods,
    pet_friendly: input.petFriendly,
    parking_needed: input.parkingNeeded,
    amenities_wishlist: input.amenitiesWishlist,
    additional_notes: input.additionalNotes,
    preferred_lease_length: input.preferredLeaseLength,
  };
}

function mapRowToRequirements(
  row: TenantRequirementsTable
): TenantRequirements {
  return {
    profileId: row.profile_id,
    propertyType: row.property_type as PropertyType,
    preferredLocation: row.preferred_location,
    monthlyBudget: row.monthly_budget,
    moveInDate: row.move_in_date,
    bedrooms: row.bedrooms as Bedrooms,
    bathrooms: row.bathrooms as Bathrooms,
    minSizeSqm: row.min_size_sqm,
    furnishing: row.furnishing as Furnishing,
    preferredNeighborhoods: row.preferred_neighborhoods ?? [],
    petFriendly: row.pet_friendly ?? false,
    parkingNeeded: row.parking_needed ?? false,
    amenitiesWishlist: row.amenities_wishlist ?? [],
    additionalNotes: row.additional_notes,
    preferredLeaseLength: row.preferred_lease_length as LeaseLength | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertTenantProfile(
  input: UpsertTenantProfileInput
): Promise<TenantProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_profile")
    .upsert(mapProfileInputToRow(input), { onConflict: "profile_id" })
    .select()
    .single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to save tenant profile");
  }

  return mapRowToProfile(data as TenantProfileTable);
}

export async function upsertTenantRequirements(
  input: UpsertTenantRequirementsInput
): Promise<TenantRequirements> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_requirements")
    .upsert(mapRequirementsInputToRow(input), { onConflict: "profile_id" })
    .select()
    .single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to save tenant requirements");
  }

  return mapRowToRequirements(data as TenantRequirementsTable);
}

export async function getTenantProfileByProfileId(
  profileId: string
): Promise<TenantProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_profile")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch tenant profile");
  }

  return data ? mapRowToProfile(data as TenantProfileTable) : null;
}

export async function getTenantRequirementsByProfileId(
  profileId: string
): Promise<TenantRequirements | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_requirements")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch tenant requirements");
  }

  return data ? mapRowToRequirements(data as TenantRequirementsTable) : null;
}

/** First names for a set of tenants, keyed by profile id. Relies on
 * `owners_select_tenant_profile_for_own_matches` RLS to silently drop any id the caller
 * (an owner) doesn't have a match with — no ownership check needed here. */
export async function getFirstNamesByProfileIds(
  profileIds: string[]
): Promise<Record<string, string>> {
  if (profileIds.length === 0) return {};

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenant_profile")
    .select("profile_id, first_name")
    .in("profile_id", profileIds);

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch tenant names");
  }

  return Object.fromEntries(
    (data || []).map((row) => [row.profile_id, row.first_name])
  );
}

/** Fetch a tenant's profile + requirements as the owner side of a match. Relies on
 * `owners_select_tenant_profile_for_own_matches` / `..._requirements_...` RLS policies to
 * scope this to tenants the caller actually has a match with — no ownership check here. */
export async function getTenantDetailByTenantId(tenantId: string): Promise<{
  profile: TenantProfile | null;
  requirements: TenantRequirements | null;
}> {
  const [profile, requirements] = await Promise.all([
    getTenantProfileByProfileId(tenantId),
    getTenantRequirementsByProfileId(tenantId),
  ]);

  return { profile, requirements };
}
