import { describe, it, expect } from "vitest";
import {
  propertyDraftSchema,
  propertyPublishSchema,
  propertyFormPublishClientSchema,
  imageManifestSchema,
  imageFileSchema,
  imageFilesSchema,
  schemaForIntent,
  parsePropertyFormData,
  SECTION_FIELDS,
  CLEARABLE_FIELDS,
} from "../schema";
import {
  AMENITY_VALUES,
  BUILDING_FACILITY_VALUES,
  UNIT_AMENITY_VALUES,
  isBuildingFacility,
} from "../types";
import {
  createMockFile,
  createMockPropertyFormData,
} from "@/lib/__mocks__/test-utils";

const completePayload = {
  intent: "publish",
  propertyType: "condo",
  title: "Bright two bedroom near BTS",
  location: "Thonglor, Bangkok",
  latitude: "13.7308",
  longitude: "100.5698",
  monthlyRent: "45000",
  bedrooms: "2",
  bathrooms: "1",
  furnishedStatus: "furnished",
  areaSqm: "85",
  amenities: ["ac", "wifi"],
  images: JSON.stringify([{ id: null, fileIndex: 0, sortOrder: 0 }]),
  acceptTerms: "on",
  confirmAccuracy: "on",
};

describe("propertyDraftSchema", () => {
  it("accepts a payload with nothing but an intent", () => {
    const result = propertyDraftSchema.safeParse({ intent: "draft" });

    expect(result.success).toBe(true);
    expect(result.data?.amenities).toEqual([]);
    expect(result.data?.images).toEqual([]);
  });

  it("accepts a title-only draft", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      title: "Work in progress",
    });

    expect(result.success).toBe(true);
  });

  it("still rejects malformed values", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      title: "x".repeat(101),
      monthlyRent: "-5",
    });

    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((issue) => issue.path[0]);
    expect(fields).toContain("title");
    expect(fields).toContain("monthlyRent");
  });

  it("coerces numeric strings from FormData", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      monthlyRent: "45000",
      bedrooms: "2",
    });

    expect(result.data?.monthlyRent).toBe(45000);
    expect(result.data?.bedrooms).toBe(2);
  });
});

describe("propertyPublishSchema", () => {
  it("accepts a complete listing", () => {
    const result = propertyPublishSchema.safeParse(completePayload);

    expect(result.success).toBe(true);
  });

  it("rejects the near-empty payload a draft would allow", () => {
    const result = propertyPublishSchema.safeParse({ intent: "publish" });

    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining([
        "propertyType",
        "title",
        "location",
        "monthlyRent",
        "furnishedStatus",
      ])
    );
  });

  it("requires at least one photo", () => {
    const result = propertyPublishSchema.safeParse({
      ...completePayload,
      images: "[]",
    });

    expect(result.success).toBe(false);
    expect(
      result.error!.issues.some((issue) =>
        issue.message.includes("At least one photo")
      )
    ).toBe(true);
  });

  it("requires both confirmations", () => {
    for (const field of ["acceptTerms", "confirmAccuracy"]) {
      const result = propertyPublishSchema.safeParse({
        ...completePayload,
        [field]: "",
      });

      expect(result.success).toBe(false);
      expect(result.error!.issues.some((i) => i.path[0] === field)).toBe(true);
    }
  });
});

describe("listing detail fields", () => {
  it("lets a draft omit all of them", () => {
    expect(propertyDraftSchema.safeParse({ intent: "draft" }).success).toBe(
      true
    );
  });

  it("keeps deposit, availability and floor optional on a live listing", () => {
    const result = propertyPublishSchema.safeParse(completePayload);

    expect(result.success).toBe(true);
    expect(result.data?.securityDepositMonths).toBeUndefined();
    expect(result.data?.availableFrom).toBeUndefined();
    expect(result.data?.floorNumber).toBeUndefined();
  });

  it("requires the floor area to publish", () => {
    const withoutArea: Record<string, unknown> = { ...completePayload };
    delete withoutArea.areaSqm;

    const result = propertyPublishSchema.safeParse(withoutArea);

    expect(result.success).toBe(false);
    expect(result.error!.issues.some((i) => i.path[0] === "areaSqm")).toBe(
      true
    );
  });

  it("accepts an explicit null so a saved value can be cleared", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      areaSqm: null,
      availableFrom: null,
    });

    expect(result.success).toBe(true);
    expect(result.data?.areaSqm).toBeNull();
  });

  it("rejects a non-ISO date", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      availableFrom: "01/11/2026",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a date that is not a real day", () => {
    expect(
      propertyDraftSchema.safeParse({
        intent: "draft",
        availableFrom: "2026-02-30",
      }).success
    ).toBe(false);
  });

  it("rejects a zero or negative floor area", () => {
    for (const areaSqm of ["0", "-5"]) {
      expect(
        propertyDraftSchema.safeParse({ intent: "draft", areaSqm }).success
      ).toBe(false);
    }
  });

  it("rejects a deposit beyond 24 months", () => {
    expect(
      propertyDraftSchema.safeParse({
        intent: "draft",
        securityDepositMonths: "36",
      }).success
    ).toBe(false);
  });

  it("coerces the numeric strings FormData delivers", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      areaSqm: "85.5",
      floorNumber: "18",
      securityDepositMonths: "2",
    });

    expect(result.data?.areaSqm).toBe(85.5);
    expect(result.data?.floorNumber).toBe(18);
    expect(result.data?.securityDepositMonths).toBe(2);
  });
});

describe("amenity split", () => {
  it("covers every amenity exactly once across the two groups", () => {
    const split = [...BUILDING_FACILITY_VALUES, ...UNIT_AMENITY_VALUES];

    // A missed amenity would silently vanish from the form.
    expect([...split].sort()).toEqual([...AMENITY_VALUES].sort());
    expect(new Set(split).size).toBe(split.length);
  });

  it("classifies building-level amenities as facilities", () => {
    expect(isBuildingFacility("pool")).toBe(true);
    expect(isBuildingFacility("gym")).toBe(true);
    expect(isBuildingFacility("ac")).toBe(false);
    expect(isBuildingFacility("wifi")).toBe(false);
  });
});

describe("minimum lease", () => {
  it("rejects anything below one month", () => {
    expect(
      propertyDraftSchema.safeParse({
        intent: "draft",
        minimumLeaseMonths: "0",
      }).success
    ).toBe(false);
  });

  it("accepts a custom term beyond the presets", () => {
    const result = propertyDraftSchema.safeParse({
      intent: "draft",
      minimumLeaseMonths: "24",
    });

    expect(result.success).toBe(true);
    expect(result.data?.minimumLeaseMonths).toBe(24);
  });

  it("stays optional on publish", () => {
    expect(propertyPublishSchema.safeParse(completePayload).success).toBe(true);
  });
});

describe("SECTION_FIELDS", () => {
  it("covers five sections", () => {
    expect(Object.keys(SECTION_FIELDS)).toEqual([
      "basics",
      "specs",
      "photos",
      "amenities",
      "headline",
    ]);
  });

  it("keeps the location fields together, since a split would discard the building name", () => {
    expect(SECTION_FIELDS.basics).toEqual(
      expect.arrayContaining([
        "location",
        "latitude",
        "longitude",
        "buildingName",
      ])
    );
  });

  it("assigns every clearable field to a section", () => {
    const assigned = Object.values(SECTION_FIELDS).flat() as string[];

    for (const field of CLEARABLE_FIELDS) {
      expect(assigned).toContain(field);
    }
  });
});

describe("parsePropertyFormData clearing", () => {
  it("turns a listed cleared field into an explicit null", () => {
    const formData = createMockPropertyFormData({ fields: { title: "Kept" } });
    formData.set("clearedFields", JSON.stringify(["areaSqm"]));

    const { payload } = parsePropertyFormData(formData);

    // null is what tells save_property to empty the column; omitting the key would
    // preserve whatever was stored.
    expect(payload.areaSqm).toBeNull();
    expect(payload.title).toBe("Kept");
  });

  it("ignores fields that are not clearable", () => {
    const formData = createMockPropertyFormData({ fields: { title: "Kept" } });
    formData.set("clearedFields", JSON.stringify(["title", "monthlyRent"]));

    const { payload } = parsePropertyFormData(formData);

    expect(payload.title).toBe("Kept");
    expect(payload).not.toHaveProperty("monthlyRent");
  });

  it("survives a malformed clearedFields entry", () => {
    const formData = createMockPropertyFormData({ fields: { title: "Kept" } });
    formData.set("clearedFields", "{not json");

    expect(() => parsePropertyFormData(formData)).not.toThrow();
  });
});

describe("schemaForIntent", () => {
  it("dispatches on the intent", () => {
    expect(schemaForIntent("publish")).toBe(propertyPublishSchema);
    expect(schemaForIntent("draft")).toBe(propertyDraftSchema);
    // Anything unrecognised is treated as a draft: the lenient branch cannot publish.
    expect(schemaForIntent(undefined)).toBe(propertyDraftSchema);
  });
});

describe("imageManifestSchema", () => {
  it("parses a valid manifest", () => {
    const result = imageManifestSchema.safeParse(
      JSON.stringify([
        {
          id: "3f1b9c2e-6a4d-4b8e-9f27-1c5ad0e7b912",
          fileIndex: null,
          sortOrder: 0,
        },
        { id: null, fileIndex: 0, sortOrder: 1 },
      ])
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("rejects malformed JSON", () => {
    const result = imageManifestSchema.safeParse("{not json");

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Invalid image manifest");
  });

  it("rejects an entry that sets both id and fileIndex", () => {
    const result = imageManifestSchema.safeParse(
      JSON.stringify([
        {
          id: "3f1b9c2e-6a4d-4b8e-9f27-1c5ad0e7b912",
          fileIndex: 0,
          sortOrder: 0,
        },
      ])
    );

    expect(result.success).toBe(false);
  });

  it("rejects an entry that sets neither", () => {
    const result = imageManifestSchema.safeParse(
      JSON.stringify([{ id: null, fileIndex: null, sortOrder: 0 }])
    );

    expect(result.success).toBe(false);
  });

  it("rejects more than ten images", () => {
    const entries = Array.from({ length: 11 }, (_, index) => ({
      id: null,
      fileIndex: index,
      sortOrder: index,
    }));

    const result = imageManifestSchema.safeParse(JSON.stringify(entries));

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toContain("Maximum 10");
  });
});

describe("image file validation", () => {
  it("accepts a small JPEG", () => {
    expect(
      imageFileSchema.safeParse(createMockFile("a.jpg", "image/jpeg", 1024))
        .success
    ).toBe(true);
  });

  it("rejects a file over 5MB", () => {
    const result = imageFileSchema.safeParse(
      createMockFile("big.jpg", "image/jpeg", 6 * 1024 * 1024)
    );

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toContain("under 5MB");
  });

  it("rejects an unsupported type", () => {
    const result = imageFileSchema.safeParse(
      createMockFile("doc.pdf", "application/pdf", 1024)
    );

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toContain("JPEG, PNG and WebP");
  });

  it("rejects more than ten files", () => {
    const files = Array.from({ length: 11 }, (_, i) =>
      createMockFile(`${i}.png`, "image/png", 100)
    );

    expect(imageFilesSchema.safeParse(files).success).toBe(false);
  });
});

describe("parsePropertyFormData", () => {
  it("splits scalars, repeated amenities and files", () => {
    const file = createMockFile("a.jpg", "image/jpeg", 512);
    const formData = createMockPropertyFormData({
      intent: "draft",
      fields: { title: "A place", monthlyRent: 30000 },
      amenities: ["ac", "wifi", "ac"],
      files: [file],
      images: [{ id: null, fileIndex: 0, sortOrder: 0 }],
    });

    const { payload, files } = parsePropertyFormData(formData);

    expect(payload.title).toBe("A place");
    expect(payload.monthlyRent).toBe("30000");
    // Duplicates are collapsed so a double-submit cannot store the same amenity twice.
    expect(payload.amenities).toEqual(["ac", "wifi"]);
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("a.jpg");
  });

  it("drops empty strings so a blank field does not overwrite a saved value", () => {
    const formData = createMockPropertyFormData({
      fields: { title: "Kept", description: "" },
    });

    const { payload } = parsePropertyFormData(formData);

    expect(payload.title).toBe("Kept");
    expect(payload).not.toHaveProperty("description");
  });
});

describe("propertyFormPublishClientSchema", () => {
  it("validates the RHF value object, where numbers are already numbers", () => {
    const result = propertyFormPublishClientSchema.safeParse({
      propertyType: "condo",
      title: "Bright two bedroom near BTS",
      location: "Thonglor, Bangkok",
      latitude: 13.7308,
      longitude: 100.5698,
      monthlyRent: 45000,
      bedrooms: 2,
      bathrooms: 1,
      description: "",
      furnishedStatus: "furnished",
      areaSqm: 85,
      amenities: [],
      acceptTerms: true,
      confirmAccuracy: true,
      imageCount: 1,
    });

    expect(result.success).toBe(true);
  });

  it("reports a missing photo through imageCount", () => {
    const result = propertyFormPublishClientSchema.safeParse({
      propertyType: "condo",
      title: "Bright two bedroom near BTS",
      location: "Thonglor, Bangkok",
      latitude: 13.7308,
      longitude: 100.5698,
      monthlyRent: 45000,
      bedrooms: 2,
      bathrooms: 1,
      furnishedStatus: "furnished",
      areaSqm: 85,
      amenities: [],
      acceptTerms: true,
      confirmAccuracy: true,
      imageCount: 0,
    });

    expect(result.success).toBe(false);
    expect(result.error!.issues.some((i) => i.path[0] === "imageCount")).toBe(
      true
    );
  });
});
