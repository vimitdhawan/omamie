import { z } from "zod";
import { PasswordInputValidation } from "@/lib/validations/password";

export const roleEnum = z.enum(["agent", "owner", "tenant"], {
  message: "Please select a role",
});

export type UserRole = z.infer<typeof roleEnum>;

export const USER_ROLES: Record<UserRole, string> = {
  agent: "Agent",
  owner: "Owner",
  tenant: "Tenant",
} as const;

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLES).map(
  ([value, label]) => ({ value, label })
);

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: PasswordInputValidation,
    confirmPassword: z.string(),
    fullName: z.string().min(1, "Full name is required"),
    role: roleEnum,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
