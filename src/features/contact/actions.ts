"use server";

import { contactSchema } from "./schema";
import { submitContactMessage } from "./service";
import type { ContactActionState } from "./schema";

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
    const result = await submitContactMessage({
      full_name: validationResult.data.fullName,
      email: validationResult.data.email,
      phone: validationResult.data.phone,
      subject: validationResult.data.subject,
      message: validationResult.data.message,
    });

    if (!result.success) {
      return { errorMessage: result.errorMessage };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send message";
    return { errorMessage };
  }
}
