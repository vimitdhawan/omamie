import { requireAdmin } from "../shared/auth";
import {
  findPropertiesForReview,
  listAllProperties,
  getPropertyById,
  updatePropertyStatus,
} from "./repository";
import type { AdminPropertyFilter } from "./types";

export async function getReviewQueue() {
  await requireAdmin();
  return await findPropertiesForReview();
}

export async function getAllProperties(filters?: AdminPropertyFilter) {
  await requireAdmin();
  return await listAllProperties(filters);
}

export async function getPropertyDetail(propertyId: string) {
  await requireAdmin();
  return await getPropertyById(propertyId);
}

export async function approveProperty(propertyId: string): Promise<void> {
  await requireAdmin();
  await updatePropertyStatus(propertyId, "active");
}

export async function rejectProperty(propertyId: string): Promise<void> {
  await requireAdmin();
  await updatePropertyStatus(propertyId, "inactive");
}
