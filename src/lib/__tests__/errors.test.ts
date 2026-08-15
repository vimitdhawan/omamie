import { describe, it, expect } from "vitest";
import { AppError, isAppError, getErrorMessage } from "../errors";
import type { ErrorCode } from "../errors";

describe("AppError", () => {
  it("should create an error with code, message, and statusCode", () => {
    const error = new AppError("CONFLICT", "Email already exists", 409);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("CONFLICT");
    expect(error.message).toBe("Email already exists");
    expect(error.statusCode).toBe(409);
  });

  it("should default statusCode to 500", () => {
    const error = new AppError("INTERNAL_ERROR", "Something went wrong");

    expect(error.statusCode).toBe(500);
  });

  it("should be an instance of Error", () => {
    const error = new AppError("UNAUTHORIZED", "Not authorized");

    expect(error).toBeInstanceOf(Error);
  });
});

describe("isAppError", () => {
  it("should return true for AppError instances", () => {
    const error = new AppError("CONFLICT", "Already exists", 409);

    expect(isAppError(error)).toBe(true);
  });

  it.each([
    [new Error("Regular error"), false],
    [null, false],
    [undefined, false],
    [{ code: "CONFLICT", message: "test" }, false],
    ["error message", false],
  ])("should return false for %s", (value, expected) => {
    expect(isAppError(value)).toBe(expected);
  });
});

describe("getErrorMessage", () => {
  it.each([
    ["VALIDATION_ERROR", "Please check your input and try again"],
    ["NOT_FOUND", "The requested resource was not found"],
    ["UNAUTHORIZED", "You are not authorized to perform this action"],
    ["CONFLICT", "This resource already exists"],
    [
      "EXTERNAL_SERVICE_ERROR",
      "An external service error occurred. Please try again",
    ],
    [
      "INTERNAL_ERROR",
      "An internal server error occurred. Please try again later",
    ],
  ])(
    "should return correct message for %s",
    (code: string, expectedMessage: string) => {
      expect(getErrorMessage(code as ErrorCode)).toBe(expectedMessage);
    }
  );
});
