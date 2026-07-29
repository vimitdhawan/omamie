"use server";

import { listPropertySchema } from "./schema";
import {
  listProperty,
  getMyProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  changePropertyStatus,
} from "./service";
import type { PropertyActionResult } from "./types";
import { revalidatePath } from "next/cache";

function extractFirstError(issues: Array<{ message: string }>): string {
  return issues[0]?.message ?? "Invalid input";
}

export async function listPropertyAction(
  _prev: PropertyActionResult | null,
  formData: FormData
): Promise<PropertyActionResult> {
  const raw = {
    listingRole: (formData.get("listingRole") ?? "owner") as string,
    propertyType: (formData.get("propertyType") ?? "") as string,
    location: (formData.get("location") ?? "") as string,
    rentAmount: Number(formData.get("rentAmount") ?? 0),
    currency: (formData.get("currency") ?? "THB") as string,
    bedrooms: Number(formData.get("bedrooms") ?? 1),
    bathrooms: Number(formData.get("bathrooms") ?? 1),
    furnishing: (formData.get("furnishing") ?? "none") as string,
    amenities: formData.getAll("amenities") as string[],
    description: (formData.get("description") ?? "") as string,
    contactName: (formData.get("contactName") ?? "") as string,
  };

  const parsed = listPropertySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: extractFirstError(parsed.error.issues) };
  }

  const result = await listProperty(parsed.data);

  if (result.success) {
    revalidatePath("/dashboard/properties");
    return {
      success: true,
      message: "Your property has been listed successfully!",
      data: result.data,
    };
  }

  return result;
}

export async function listPropertyActionData(
  data: import("./schema").ListPropertyFormData
): Promise<PropertyActionResult> {
  const parsed = listPropertySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: extractFirstError(parsed.error.issues) };
  }

  const result = await listProperty(parsed.data);

  if (result.success) {
    revalidatePath("/dashboard/properties");
    return {
      success: true,
      message: "Your property has been listed successfully!",
      data: result.data,
    };
  }

  return result;
}

export async function getMyPropertiesAction(): Promise<{
  data: Awaited<ReturnType<typeof getMyProperties>>["data"];
  error: string | null;
}> {
  return getMyProperties();
}

export async function getPropertyAction(
  id: string
): Promise<PropertyActionResult> {
  return getProperty(id);
}

export async function updatePropertyAction(
  _prev: PropertyActionResult | null,
  formData: FormData
): Promise<PropertyActionResult> {
  const raw = {
    id: (formData.get("id") ?? "") as string,
    listingRole: (formData.get("listingRole") ?? "owner") as "owner" | "agent",
    propertyType: (formData.get("propertyType") ?? "") as
      | "apartment"
      | "condo"
      | "house"
      | "townhouse",
    location: (formData.get("location") ?? "") as string,
    rentAmount: Number(formData.get("rentAmount") ?? 0),
    currency: (formData.get("currency") ?? "THB") as string,
    bedrooms: Number(formData.get("bedrooms") ?? 1),
    bathrooms: Number(formData.get("bathrooms") ?? 1),
    furnishing: (formData.get("furnishing") ?? "none") as
      | "fully"
      | "partial"
      | "none",
    amenities: formData.getAll("amenities") as string[],
    description: (formData.get("description") ?? "") as string,
    contactName: (formData.get("contactName") ?? "") as string,
    contactEmail: (formData.get("contactEmail") ?? "") as string,
    contactPhone: (formData.get("contactPhone") ?? "") as string,
    acceptTerms: formData.get("acceptTerms") === "true",
    acceptMarketing: formData.get("acceptMarketing") === "true",
    status: (formData.get("status") ?? "draft") as
      | "draft"
      | "active"
      | "rented"
      | "archived"
      | "pending",
  };

  const { id, ...updates } = raw;

  if (!id) {
    return { success: false, error: "Property ID is required" };
  }

  const result = await updateProperty({ id, ...updates });

  if (result.success) {
    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
  }

  return result;
}

export async function deletePropertyAction(
  id: string
): Promise<PropertyActionResult> {
  const result = await deleteProperty(id);

  if (result.success) {
    revalidatePath("/dashboard/properties");
  }

  return result;
}

export async function changePropertyStatusAction(
  id: string,
  status: "active" | "rented" | "archived"
): Promise<PropertyActionResult> {
  const result = await changePropertyStatus(id, status);

  if (result.success) {
    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
  }

  return result;
}
