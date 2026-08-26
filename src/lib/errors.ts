export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "EXTERNAL_SERVICE_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

const errorMessages: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Please check your input and try again",
  NOT_FOUND: "The requested resource was not found",
  UNAUTHORIZED: "You are not authorized to perform this action",
  FORBIDDEN: "You do not have permission to perform this action",
  CONFLICT: "This resource already exists",
  EXTERNAL_SERVICE_ERROR:
    "An external service error occurred. Please try again",
  INTERNAL_ERROR: "An internal server error occurred. Please try again later",
};

export function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code] || "An unexpected error occurred";
}
