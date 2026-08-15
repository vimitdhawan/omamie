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

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "category" in error &&
    "code" in error &&
    "message" in error
  );
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

export function mapSupabaseError(error: {
  message?: string;
  status?: number;
}): AuthError {
  const message = error.message || "";
  const status = error.status || 0;

  if (
    message.includes("duplicate key") ||
    message.includes("already registered")
  ) {
    return {
      category: "auth",
      code: "EMAIL_EXISTS",
      message: getErrorMessage("EMAIL_EXISTS"),
      field: "email",
    };
  }

  if (message.includes("Invalid login credentials")) {
    return {
      category: "auth",
      code: "INVALID_CREDENTIALS",
      message: getErrorMessage("INVALID_CREDENTIALS"),
    };
  }

  if (message.includes("Email not confirmed")) {
    return {
      category: "auth",
      code: "EMAIL_NOT_CONFIRMED",
      message: getErrorMessage("EMAIL_NOT_CONFIRMED"),
      field: "email",
    };
  }

  if (status >= 500) {
    return {
      category: "server",
      code: "SERVER_ERROR",
      message: getErrorMessage("SERVER_ERROR"),
    };
  }

  if (
    status === 0 ||
    message.includes("network") ||
    message.includes("timeout")
  ) {
    return {
      category: "network",
      code: "NETWORK_ERROR",
      message: getErrorMessage("NETWORK_ERROR"),
    };
  }

  return {
    category: "server",
    code: "AUTH_FAILED",
    message: getErrorMessage("AUTH_FAILED"),
  };
}
