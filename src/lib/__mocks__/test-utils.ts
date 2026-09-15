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

/** A File that behaves like a real upload for schema and service tests. */
export function createMockFile(
  name = "photo.jpg",
  type = "image/jpeg",
  size = 1024
): File {
  const file = new File([new Uint8Array(size)], name, { type });
  // jsdom computes size from the parts, but be explicit so oversize cases are exact.
  Object.defineProperty(file, "size", { value: size });
  return file;
}

/** Builds a property-form submission the way the client component does. */
export function createMockPropertyFormData(options?: {
  intent?: "draft" | "publish";
  propertyId?: string;
  fields?: Record<string, string | number>;
  amenities?: string[];
  images?: Array<{
    id: string | null;
    fileIndex: number | null;
    sortOrder: number;
  }>;
  files?: File[];
}): FormData {
  const formData = new FormData();
  formData.set("intent", options?.intent ?? "draft");
  if (options?.propertyId) formData.set("propertyId", options.propertyId);

  for (const [key, value] of Object.entries(options?.fields ?? {})) {
    formData.set(key, String(value));
  }
  for (const amenity of options?.amenities ?? []) {
    formData.append("amenities", amenity);
  }
  for (const file of options?.files ?? []) {
    formData.append("files", file);
  }
  formData.set("images", JSON.stringify(options?.images ?? []));

  return formData;
}
