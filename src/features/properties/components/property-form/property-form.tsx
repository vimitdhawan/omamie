"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  Camera,
  Eye,
  Monitor,
  Pencil,
  Ruler,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { savePropertyAction } from "../../actions";
import {
  AMENITIES,
  CLEARABLE_FIELDS,
  FURNISHED_STATUS,
  PROPERTY_TYPES,
  OPTIONAL_SECTIONS,
  SECTION_FIELDS,
  SECTION_META,
  propertyFormClientSchema,
  propertyFormPublishClientSchema,
  validateSection,
  type PropertyActionState,
  type PropertyFormValues,
  type PropertySection,
} from "../../schema";
import type { Property } from "../../types";
import { SectionCard, EmptyHint, SectionChips } from "./section-card";
import type { SectionStatus } from "./section-card";
import { SectionDrawer } from "./section-drawer";
import { BasicsSection } from "./basics-section";
import { SpecsSection } from "./specs-section";
import { AmenitiesSection } from "./amenities-section";
import { ImagesSection } from "./images-section";
import { HeadlineSection } from "./headline-section";
import { PropertyPreview } from "./property-preview";
import { PublishPanel } from "./publish-panel";
import { toDraftImages, type DraftImage } from "./types";

interface PropertyFormProps {
  property?: Property;
}

const SECTION_ICONS: Record<PropertySection, React.ReactNode> = {
  basics: <Building2 className="size-5" />,
  specs: <Ruler className="size-5" />,
  photos: <Camera className="size-5" />,
  amenities: <Sparkles className="size-5" />,
  headline: <Type className="size-5" />,
};

function toFormValues(property?: Property): PropertyFormValues {
  return {
    propertyType: property?.propertyType ?? undefined,
    title: property?.title ?? "",
    location: property?.location ?? "",
    latitude: property?.locationDetails?.latitude,
    longitude: property?.locationDetails?.longitude,
    locationContext: undefined,
    // The building name is the condo registry entry now. Older listings stored it on the
    // location row instead, so fall back to that rather than showing them a blank field.
    buildingName:
      property?.condo?.name ?? property?.locationDetails?.addressLine2 ?? "",
    monthlyRent: property?.monthlyRent ?? undefined,
    securityDepositMonths: property?.securityDepositMonths ?? null,
    minimumLeaseMonths: property?.minimumLeaseMonths ?? null,
    availableFrom: property?.availableFrom ?? null,
    areaSqm: property?.areaSqm ?? null,
    floorNumber: property?.floorNumber ?? null,
    totalFloors: property?.totalFloors ?? null,
    bedrooms: property?.bedrooms ?? 1,
    bathrooms: property?.bathrooms ?? 1,
    description: property?.description ?? "",
    furnishedStatus: property?.furnishedStatus ?? undefined,
    amenities: property?.amenities ?? [],
    acceptTerms: false,
    confirmAccuracy: false,
    imageCount: property?.images.length ?? 0,
  };
}

/**
 * The whole listing on one page.
 *
 * One form, one submit. Each section is edited in a drawer that will not close while its
 * fields are invalid, so anything submitted is already coherent. "Save draft" persists
 * whatever exists; "Publish" additionally enforces everything a live listing needs.
 */
export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [images, setImages] = useState<DraftImage[]>(() =>
    toDraftImages(property?.images ?? [])
  );
  // Re-sync the image list whenever the server sends a newer version of this listing.
  // After a save, photos that were local File objects now exist as rows; without this they
  // would be re-uploaded on the next save. Adjusting state during render rather than in an
  // effect (and rather than remounting via key, which would reset useActionState and
  // swallow the save result).
  const [syncedAt, setSyncedAt] = useState(property?.updatedAt);
  if (property?.updatedAt !== syncedAt) {
    setSyncedAt(property?.updatedAt);
    setImages(toDraftImages(property?.images ?? []));
  }
  const [openSection, setOpenSection] = useState<PropertySection | null>(null);
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">(
    "desktop"
  );
  // Which button was pressed, so only that one shows a spinner while both disable. Set
  // from the click handler and then masked by useActionState's own isPending, so there is
  // no separate effect to keep the two in sync.
  const [requestedIntent, setRequestedIntent] = useState<
    "draft" | "publish" | null
  >(null);
  // Sections with no required fields are "done" once the owner has actually looked at
  // them and saved — there is nothing to detect from the values alone.
  const [confirmedSections, setConfirmedSections] = useState<
    Set<PropertySection>
  >(() => new Set());

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormClientSchema),
    mode: "onChange",
    defaultValues: toFormValues(property),
  });

  const [state, formAction, isPending] = useActionState<
    PropertyActionState | null,
    FormData
  >(savePropertyAction, null);

  const pendingIntent = isPending ? requestedIntent : null;

  // useWatch rather than form.watch(): watch() returns a fresh function each render, which
  // makes the React Compiler skip memoizing this component entirely.
  const values = useWatch({ control: form.control }) as PropertyFormValues;
  const errors = form.formState.errors;

  // imageCount lives in the form purely so the publish gate can validate it alongside
  // everything else; the images themselves are Files and stay outside RHF.
  useEffect(() => {
    form.setValue("imageCount", images.length, { shouldValidate: false });
  }, [images.length, form]);

  useEffect(() => {
    if (!state) return;

    if (state.errorMessage) {
      toast.error(state.errorMessage);
    }

    if (state.errors) {
      for (const [field, messages] of Object.entries(state.errors)) {
        // The server validates the image manifest under "images"; the form tracks it as
        // "imageCount" so the publish gate can check it with everything else.
        const target = field === "images" ? "imageCount" : field;
        if (target in propertyFormClientSchema.shape && messages?.[0]) {
          form.setError(target as keyof PropertyFormValues, {
            message: messages[0],
          });
        }
      }
      toast.error("Please fix the highlighted fields");
    }

    if (state.success) {
      for (const warning of state.imageWarnings ?? []) {
        toast.warning(`${warning.fileName}: ${warning.message}`);
      }

      if (state.status === "review") {
        toast.success("Listing submitted for review");
        router.push("/properties");
        return;
      }

      toast.success("Draft saved");
      // Stay on the form, but re-read from the database so the image list above can swap
      // freshly-uploaded Files for their saved rows.
      if (state.created && state.propertyId) {
        router.replace(`/properties/${state.propertyId}/edit`);
      } else {
        router.refresh();
      }
    }
  }, [state, form, router]);

  const buildFormData = (intent: "draft" | "publish"): FormData => {
    const data = form.getValues();
    const formData = new FormData();

    formData.set("intent", intent);
    if (property?.id || state?.propertyId) {
      formData.set("propertyId", property?.id ?? state!.propertyId!);
    }

    const scalars: Array<[string, unknown]> = [
      ["propertyType", data.propertyType],
      ["title", data.title],
      ["location", data.location],
      ["latitude", data.latitude],
      ["longitude", data.longitude],
      ["locationContext", data.locationContext],
      ["buildingName", data.buildingName],
      ["monthlyRent", data.monthlyRent],
      ["securityDepositMonths", data.securityDepositMonths],
      ["minimumLeaseMonths", data.minimumLeaseMonths],
      ["availableFrom", data.availableFrom],
      ["areaSqm", data.areaSqm],
      ["floorNumber", data.floorNumber],
      ["totalFloors", data.totalFloors],
      ["bedrooms", data.bedrooms],
      ["bathrooms", data.bathrooms],
      ["description", data.description],
      ["furnishedStatus", data.furnishedStatus],
    ];
    for (const [key, value] of scalars) {
      if (value !== undefined && value !== null && value !== "") {
        formData.set(key, String(value));
      }
    }

    // An omitted key means "not carried by this submission" and preserves the stored value,
    // so emptying a field has to be stated explicitly or it would silently never clear.
    const cleared = CLEARABLE_FIELDS.filter((field) => {
      const value = data[field];
      return value === null || value === "";
    });
    formData.set("clearedFields", JSON.stringify(cleared));

    for (const amenity of data.amenities) {
      formData.append("amenities", amenity);
    }

    if (intent === "publish") {
      formData.set("acceptTerms", data.acceptTerms ? "on" : "");
      formData.set("confirmAccuracy", data.confirmAccuracy ? "on" : "");
    }

    // The manifest carries order and identity; files ride alongside and are addressed by
    // their index in the `files` entries.
    const manifest = images.map((image, sortOrder) => {
      if (image.kind === "saved") {
        return { id: image.id, fileIndex: null, sortOrder };
      }
      const fileIndex = formData.getAll("files").length;
      formData.append("files", image.file);
      return { id: null, fileIndex, sortOrder };
    });
    formData.set("images", JSON.stringify(manifest));

    return formData;
  };

  const submit = async (intent: "draft" | "publish") => {
    if (intent === "publish") {
      const check = propertyFormPublishClientSchema.safeParse({
        ...form.getValues(),
        imageCount: images.length,
      });

      if (!check.success) {
        form.clearErrors();
        for (const issue of check.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            form.setError(field as keyof PropertyFormValues, {
              message: issue.message,
            });
          }
        }
        toast.error("This listing is not ready to publish yet");
        return;
      }
    }

    setRequestedIntent(intent);

    // `formAction` comes from useActionState, and calling it outside a transition leaves
    // isPending stuck — the buttons never show their pending state. The form has no native
    // submit (two intents share one action), so the transition has to be explicit here.
    const formData = buildFormData(intent);
    startTransition(() => {
      formAction(formData);
    });
  };

  // Derived from SECTION_FIELDS rather than hand-listed: a hand-maintained copy silently
  // stops flagging any field added later.
  const sectionErrors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(SECTION_FIELDS).map(([key, fields]) => [
          key,
          fields.some((field) => field in errors),
        ])
      ) as Record<PropertySection, boolean>,
    [errors]
  );

  const summaries = useMemo(() => {
    const rentLabel = values.monthlyRent
      ? `${formatCurrency(values.monthlyRent, "en-US", "THB")} / mo`
      : null;

    return {
      basics: {
        filled: Boolean(
          values.propertyType && values.location && values.monthlyRent
        ),
        // Rent is deliberately absent here: it is the first chip below, and repeating it
        // in the same card is noise.
        line: [
          values.propertyType ? PROPERTY_TYPES[values.propertyType] : null,
          values.buildingName,
          values.location,
        ]
          .filter(Boolean)
          .join(" · "),
        chips: [
          rentLabel,
          values.securityDepositMonths
            ? `${values.securityDepositMonths} mo deposit`
            : null,
          values.availableFrom ? `From ${values.availableFrom}` : null,
          values.minimumLeaseMonths
            ? `${values.minimumLeaseMonths} mo min lease`
            : null,
        ].filter(Boolean) as string[],
      },
      specs: {
        filled: Boolean(values.furnishedStatus),
        line: [
          `${values.bedrooms} bed`,
          `${values.bathrooms} bath`,
          values.areaSqm ? `${values.areaSqm} m²` : null,
          values.floorNumber ? `Floor ${values.floorNumber}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        chips: [
          values.furnishedStatus
            ? FURNISHED_STATUS[values.furnishedStatus]
            : null,
          values.totalFloors ? `${values.totalFloors}-storey building` : null,
        ].filter(Boolean) as string[],
      },
      photos: {
        filled: images.length > 0,
        line:
          images.length > 0
            ? `${images.length} photo${images.length === 1 ? "" : "s"}`
            : "",
        chips: images.some((image) => image.kind === "new")
          ? [
              `${images.filter((i) => i.kind === "new").length} not yet uploaded`,
            ]
          : [],
      },
      amenities: {
        // Optional section: reviewing it is what completes it, so an empty amenity list on
        // a plain house still counts once the owner has been through the drawer.
        filled:
          values.amenities.length > 0 || confirmedSections.has("amenities"),
        line: values.amenities.map((a) => AMENITIES[a]).join(", "),
        chips: [],
      },
      headline: {
        filled: Boolean(values.title),
        line: values.title ? `"${values.title}"` : "",
        chips: [],
      },
    } satisfies Record<
      PropertySection,
      { filled: boolean; line: string; chips: string[] }
    >;
  }, [values, images, confirmedSections]);

  const statusFor = (section: PropertySection): SectionStatus => {
    if (sectionErrors[section]) return "error";
    if (OPTIONAL_SECTIONS.includes(section)) {
      return summaries[section].filled ? "complete" : "empty";
    }
    // A required section is complete only when nothing in it would block publishing —
    // including the coordinates, which do not block the drawer's own Save.
    return Object.keys(validateSection(section, values)).length === 0
      ? "complete"
      : "empty";
  };

  const statusLabelFor = (section: PropertySection): string => {
    const status = statusFor(section);
    if (status === "error") return "Needs attention";
    if (status !== "complete") {
      return OPTIONAL_SECTIONS.includes(section) ? "Optional" : "Not started";
    }
    if (section === "photos") return `${images.length} uploaded`;
    if (section === "amenities") return `${values.amenities.length} selected`;
    return "Complete";
  };

  const readyCount = SECTION_META.filter(
    ({ key }) => statusFor(key) === "complete"
  ).length;

  const sectionBodies: Record<PropertySection, React.ReactNode> = {
    basics: <BasicsSection form={form} />,
    specs: <SpecsSection form={form} />,
    photos: (
      <ImagesSection
        images={images}
        onChange={setImages}
        error={errors.imageCount?.message}
      />
    ),
    amenities: <AmenitiesSection form={form} />,
    headline: <HeadlineSection form={form} />,
  };

  const editor = (
    <div className="space-y-3">
      {SECTION_META.map(({ key, title, hint }, position) => (
        <SectionCard
          key={key}
          index={position + 1}
          title={title}
          hint={hint}
          icon={SECTION_ICONS[key]}
          status={statusFor(key)}
          statusLabel={statusLabelFor(key)}
          onEdit={() => setOpenSection(key)}
        >
          {/* Chips are independent of the line: a section can have facts worth showing
              (a rent, a deposit) before it has enough for a summary sentence. */}
          {summaries[key].line || summaries[key].chips.length > 0 ? (
            <>
              {summaries[key].line && (
                <p className="text-muted-foreground truncate">
                  {summaries[key].line}
                </p>
              )}
              <SectionChips items={summaries[key].chips} />
            </>
          ) : (
            <EmptyHint>Nothing filled in yet.</EmptyHint>
          )}
        </SectionCard>
      ))}
    </div>
  );

  const preview = (
    <div className={cn(previewWidth === "mobile" && "mx-auto max-w-[320px]")}>
      <PropertyPreview values={values} images={images} />
    </div>
  );

  const previewHeader = (
    <div className="mb-2 flex items-center justify-between">
      <p className="text-muted-foreground text-uppercase-tag flex items-center gap-1.5 tracking-wider uppercase">
        <Eye className="size-3.5" />
        Live tenant preview
      </p>
      <div className="bg-surface-soft flex rounded-md p-0.5">
        {(
          [
            ["desktop", Monitor, "Desktop width"],
            ["mobile", Smartphone, "Mobile width"],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={previewWidth === key}
            onClick={() => setPreviewWidth(key)}
            className={cn(
              "rounded px-2 py-1 transition-colors",
              previewWidth === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      {isMobile ? (
        <Tabs defaultValue="edit">
          <TabsList className="bg-surface-soft w-full">
            <TabsTrigger value="edit" className="flex-1 gap-1.5">
              <Pencil className="size-3.5" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 gap-1.5">
              <Eye className="size-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            {editor}
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            {preview}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {editor}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            {previewHeader}
            {preview}
          </aside>
        </div>
      )}

      {SECTION_META.map(({ key, title, hint }, position) => (
        <SectionDrawer
          key={key}
          section={key}
          open={openSection === key}
          onOpenChange={(open) => setOpenSection(open ? key : null)}
          title={title}
          description={hint}
          step={position + 1}
          totalSteps={SECTION_META.length}
          form={form}
          onSaved={() =>
            setConfirmedSections((current) => new Set(current).add(key))
          }
        >
          {sectionBodies[key]}
        </SectionDrawer>
      ))}

      <PublishPanel
        form={form}
        readyCount={readyCount}
        totalSections={SECTION_META.length}
        pendingIntent={pendingIntent}
        status={property?.status ?? state?.status}
        onSaveDraft={() => void submit("draft")}
        onPublish={() => void submit("publish")}
      />
    </form>
  );
}
