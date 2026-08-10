"use server";

import { contactSchema } from "./schema";
import { submitContactMessage } from "./service";
import type { ContactActionState } from "./schema";
import { AppError } from "@/lib/types/error";

export async function submitContactAction(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const validationResult = contactSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await submitContactMessage({
      fullName: validationResult.data.fullName,
      email: validationResult.data.email,
      phone: validationResult.data.phone || null,
      subject: validationResult.data.subject,
      message: validationResult.data.message,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
    return {
      success: false,
      errorMessage: "Something went wrong. Please try again.",
    };
  }
}
