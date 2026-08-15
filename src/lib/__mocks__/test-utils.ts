import type { SignupFormData } from "@/features/auth/schema";

export function createMockSignupData(
  overrides?: Partial<SignupFormData>
): SignupFormData {
  return {
    email: "test@example.com",
    password: "ValidPassword123!",
    confirmPassword: "ValidPassword123!",
    fullName: "John Doe",
    role: "tenant",
    ...overrides,
  };
}

export function createMockFormData(
  data: Record<string, string | number | boolean>
): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  return formData;
}
