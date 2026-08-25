export type ErrorCategory = "validation" | "auth" | "network" | "server";

export type ErrorCode =
  | "EMAIL_INVALID"
  | "EMAIL_EXISTS"
  | "PASSWORD_WEAK"
  | "PASSWORD_MISMATCH"
  | "FIELD_REQUIRED"
  | "EMAIL_NOT_CONFIRMED"
  | "INVALID_CREDENTIALS"
  | "AUTH_FAILED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface AuthError {
  category: ErrorCategory;
  code: ErrorCode;
  message: string;
  field?: string;
}

const errorMessages: Record<ErrorCode, string> = {
  EMAIL_INVALID: "Please enter a valid email address",
  EMAIL_EXISTS: "An account with this email already exists",
  PASSWORD_WEAK: "Password does not meet the required criteria",
  PASSWORD_MISMATCH: "Passwords do not match",
  FIELD_REQUIRED: "This field is required",
  EMAIL_NOT_CONFIRMED: "Please confirm your email address to sign in",
  INVALID_CREDENTIALS: "Invalid email or password",
  AUTH_FAILED: "Authentication failed. Please try again",
  NETWORK_ERROR: "Network connection failed. Please check your internet",
  SERVER_ERROR: "Server error occurred. Please try again later",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again",
};

export function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code] || errorMessages.UNKNOWN_ERROR;
}
