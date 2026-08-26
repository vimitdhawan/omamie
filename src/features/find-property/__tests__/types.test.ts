import { describe, it, expect } from "vitest";
import {
  PROPERTY_TYPE_VALUES,
  BEDROOMS_VALUES,
  BATHROOMS_VALUES,
  FURNISHING_VALUES,
} from "../types";

describe("Find Property value arrays", () => {
  it("orders bedrooms with studio first, matching UI display order", () => {
    // Regression test: object keys like "1"/"2"/"3" are integer-like and get
    // reordered ascending by JS engines ahead of non-numeric keys such as
    // "studio", so anything deriving iteration order from Object.entries on
    // a Record keyed by these values silently breaks this ordering.
    expect(BEDROOMS_VALUES).toEqual(["studio", "1", "2", "3", "4+"]);
  });

  it("orders bathrooms as declared", () => {
    expect(BATHROOMS_VALUES).toEqual(["1", "2", "3+"]);
  });

  it("orders property types as declared", () => {
    expect(PROPERTY_TYPE_VALUES).toEqual([
      "apartment",
      "condo",
      "house",
      "townhouse",
    ]);
  });

  it("no longer offers a 'none' furnishing option", () => {
    expect(FURNISHING_VALUES).toEqual([
      "furnished",
      "partially",
      "unfurnished",
    ]);
    expect(FURNISHING_VALUES).not.toContain("none");
  });
});
