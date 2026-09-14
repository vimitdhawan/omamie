/**
 * Raised when a submission fails schema validation.
 *
 * Lives outside service.ts so the actions layer and its tests can reference it without
 * pulling in the server-only storage and repository modules.
 */
export class PropertyValidationError extends Error {
  constructor(public fieldErrors: Record<string, string[]>) {
    super("Property validation failed");
    this.name = "PropertyValidationError";
  }
}
