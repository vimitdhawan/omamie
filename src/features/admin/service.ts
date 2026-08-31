import * as repository from "./repository";
import * as contactRepository from "@/features/contact/repository";
import { sendReplyEmail } from "./email";
import type { ReplyEmailInput } from "./types";
import type { PropertyStatus } from "@/features/properties/types";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  return repository.getDashboardStats();
}

/**
 * Get all properties with optional status filter
 */
export async function getAllProperties(filters?: { status?: PropertyStatus }) {
  return repository.getAllProperties(filters);
}

/**
 * Get properties pending admin review
 */
export async function getPropertiesForReview() {
  return repository.getPropertiesForReview();
}

/**
 * Approve a property - changes status to 'active'
 * Creates a status history entry for audit trail
 */
export async function approveProperty(propertyId: string, adminId: string) {
  return repository.approveProperty(propertyId, adminId);
}

/**
 * Reject a property - changes status to 'inactive'
 * Creates a status history entry with optional reason
 */
export async function rejectProperty(
  propertyId: string,
  adminId: string,
  reason?: string
) {
  return repository.rejectProperty(propertyId, adminId, reason);
}

/**
 * Get all users in the system
 */
export async function getAllUsers() {
  return repository.getAllUsers();
}

/**
 * Get all contact messages
 */
export async function getAllContactMessages() {
  return contactRepository.getAll();
}

/**
 * Get property status history
 */
export async function getPropertyStatusHistory(propertyId: string) {
  return repository.getPropertyStatusHistory(propertyId);
}

/**
 * Send a reply to a contact message
 */
export async function sendContactReply(input: ReplyEmailInput) {
  return sendReplyEmail(input);
}
