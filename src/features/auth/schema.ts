import { z } from "zod";
import { PasswordInputValidation } from "@/lib/validations/password";

export const loginFormSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .max(254, "Less than 254 characters"),
  password: PasswordInputValidation,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export type LoginActionState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};

// signup
export const roleEnum = z.enum(["agent", "owner", "tenant", "admin"]);

export type UserRole = z.infer<typeof roleEnum>;

export const USER_ROLES = {
  agent: "Agent",
  owner: "Owner",
  tenant: "Tenant",
  admin: "Admin",
} as const;

// Admin is provisioned directly in Supabase, never through the public signup form — this
// narrower enum is what the signup schema actually validates against, so a tampered
// `role=admin` field on the signup POST is rejected server-side rather than trusted because
// the client-side form happens to only ever render agent/owner/tenant options.
export const publicSignupRoleEnum = z.enum(["agent", "owner", "tenant"]);

export const signupFormBaseSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .max(254, "Less than 254 characters"),
  password: PasswordInputValidation,
  confirmPassword: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  role: publicSignupRoleEnum,
});

// Add multiple refinements
export const signupFormSchema = signupFormBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type SignupFormData = z.infer<typeof signupFormSchema>;

export type SignupActionState = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    role?: string[];
    fullName?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};
