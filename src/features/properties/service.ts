import {
  createProperty as repoCreateProperty,
  getPropertyById as repoGetPropertyById,
  getPropertiesByOwner as repoGetPropertiesByOwner,
  updateProperty as repoUpdateProperty,
  deleteProperty as repoDeleteProperty,
} from "./repository";
import type { Property, PropertyInsert } from "./types";
import type { ListPropertyFormData } from "./schema";
import { getCurrentUser } from "@/features/auth/service";

export interface PropertyActionResult {
  success: boolean;
  error?: string;
  data?: Property;
}

function mapPropertyError(message: string): string {
  if (message.includes("duplicate key")) {
    return "A property with this information already exists";
  }
  if (message.includes("foreign key")) {
    return "Invalid owner reference";
  }
  return message;
}

function generateTitle(input: ListPropertyFormData): string {
  const propertyTypeLabels: Record<string, string> = {
    apartment: "Apartment",
    condo: "Condo",
    house: "House",
    townhouse: "Townhouse",
  };
  const typeLabel =
    propertyTypeLabels[input.propertyType] || input.propertyType;
  return `${typeLabel} in ${input.location.split(",")[0].trim()}`;
}

export async function listProperty(
  input: ListPropertyFormData
): Promise<PropertyActionResult> {
  const { user, profile } = await getCurrentUser();

  const isAuthenticated = !!user && !!profile;
  const isOwnerOrAgent = isAuthenticated && profile?.role !== "tenant";

  if (isAuthenticated && profile?.role === "tenant") {
    return { success: false, error: "Tenants cannot list properties" };
  }

  const propertyData: PropertyInsert = {
    owner_id: isOwnerOrAgent ? user!.id : null,
    listing_role: input.listingRole,
    title: generateTitle(input),
    description: "",
    property_type: input.propertyType,
    rent_amount: input.rentAmount,
    currency: input.currency,
    address: input.location,
    city: "",
    state: "",
    postal_code: "",
    country: "Thailand",
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    furnishing: input.furnishing,
    amenities: input.amenities,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
    status: isOwnerOrAgent ? input.status : "pending",
  };

  const { data, error } = await repoCreateProperty(propertyData);

  if (error) {
    return { success: false, error: mapPropertyError(error.message) };
  }

  return { success: true, data: data! };
}

export async function getMyProperties(): Promise<{
  data: Property[] | null;
  error: string | null;
}> {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    return { data: null, error: "Authentication required" };
  }

  const { data, error } = await repoGetPropertiesByOwner(user.id);

  if (error) {
    return { data: null, error: mapPropertyError(error.message) };
  }

  return { data, error: null };
}

export async function getProperty(id: string): Promise<PropertyActionResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  const { data, error } = await repoGetPropertyById(id);

  if (error) {
    return { success: false, error: mapPropertyError(error.message) };
  }

  if (data?.owner_id !== user.id) {
    return { success: false, error: "Property not found" };
  }

  return { success: true, data: data! };
}

export async function updateProperty(
  input: { id: string } & Partial<ListPropertyFormData>
): Promise<PropertyActionResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  const { id, ...updates } = input;

  const { data: existing, error: fetchError } = await repoGetPropertyById(id);

  if (fetchError || !existing) {
    return { success: false, error: "Property not found" };
  }

  if (existing.owner_id !== user.id) {
    return { success: false, error: "Property not found" };
  }

  const { data, error } = await repoUpdateProperty(
    id,
    updates as Partial<PropertyInsert>
  );

  if (error) {
    return { success: false, error: mapPropertyError(error.message) };
  }

  return { success: true, data: data! };
}

export async function deleteProperty(
  id: string
): Promise<PropertyActionResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  const { data: existing, error: fetchError } = await repoGetPropertyById(id);

  if (fetchError || !existing) {
    return { success: false, error: "Property not found" };
  }

  if (existing.owner_id !== user.id) {
    return { success: false, error: "Property not found" };
  }

  const { error } = await repoDeleteProperty(id);

  if (error) {
    return { success: false, error: mapPropertyError(error.message) };
  }

  return { success: true };
}

export async function changePropertyStatus(
  id: string,
  status: "active" | "rented" | "archived"
): Promise<PropertyActionResult> {
  return updateProperty({ id, status });
}
