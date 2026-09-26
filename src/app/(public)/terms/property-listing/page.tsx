import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "Property Listing Terms & Conditions",
  description:
    "Terms and conditions property owners agree to when listing a property on Omamie.",
};

export default function PropertyListingTermsPage() {
  const lastUpdated = "2026-09-26";

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Section>
        <SectionHeader title="Property Listing Terms & Conditions" />

        <div className="mx-auto max-w-3xl space-y-6 text-sm">
          <p className="text-muted">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>

          <p className="text-muted leading-relaxed">
            These Property Listing Terms &amp; Conditions (&quot;Listing
            Terms&quot;) apply in addition to Omamie&apos;s general{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            whenever you create, edit, or publish a property listing
            (&quot;Listing&quot;) as an owner, landlord, or an agent acting on
            an owner&apos;s behalf (&quot;Owner,&quot; &quot;you,&quot; or
            &quot;your&quot;) on the Omamie platform (&quot;Platform,&quot;
            &quot;Omamie,&quot; &quot;we,&quot; or &quot;us&quot;). By checking
            the acceptance box in the listing form, you agree to be bound by
            these Listing Terms. If you do not agree, do not create or publish a
            Listing.
          </p>

          {/* Accuracy of Listing Information */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              1. Accuracy of Listing Information
            </h2>
            <p className="text-muted leading-relaxed">
              By submitting a Listing, you confirm and warrant that:
            </p>
            <ul className="text-muted list-inside list-disc space-y-1 pl-2">
              <li>
                All information you provide — including property type, address,
                building or condo name, rent, deposit, availability, room count,
                size, floor, amenities, photos, and description — is accurate,
                current, and not misleading
              </li>
              <li>
                You are the legal owner of the property, or you have the
                owner&apos;s express authority to list, advertise, and negotiate
                on the property&apos;s behalf
              </li>
              <li>
                The property is legally permitted to be rented and is free of
                any restriction that would prevent the tenancy described in the
                Listing
              </li>
              <li>
                Photos and descriptions genuinely represent the current
                condition of the property
              </li>
              <li>
                You will promptly update or remove the Listing once the property
                is no longer available, or its details materially change
              </li>
            </ul>
            <p className="text-muted mt-3 leading-relaxed">
              You are solely responsible for the content of your Listing and for
              keeping it accurate for as long as it remains published. Omamie
              does not independently verify Listing information and is entitled
              to rely on it as submitted.
            </p>
          </div>

          {/* Owner Indemnification */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">2. Indemnification</h2>
            <p className="text-muted leading-relaxed">
              You agree to indemnify, defend, and hold harmless Omamie, its
              officers, employees, and agents from and against any claims,
              damages, losses, liabilities, costs, and expenses (including
              reasonable legal fees) arising out of or related to: (a) any
              inaccurate, misleading, or unauthorized Listing information you
              submit; (b) your lack of authority to list the property; (c) any
              dispute between you and a prospective tenant; or (d) your breach
              of these Listing Terms or applicable law.
            </p>
          </div>

          {/* No Guarantee, No Brokerage */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              3. No Guarantee of Tenancy; No Brokerage Relationship
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie provides a platform for connecting Owners with prospective
              tenants and does not guarantee that a Listing will receive
              interest, viewings, or result in a tenancy. Omamie is not a
              licensed real estate broker or agent, does not act on behalf of
              any Owner or tenant in negotiations, and is not a party to any
              lease or rental agreement arising from a Listing. Owners are
              solely responsible for screening prospective tenants, negotiating
              terms, and executing legally compliant lease agreements.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              4. Limitation of Liability
            </h2>
            <p className="text-muted leading-relaxed">
              To the fullest extent permitted by law, Omamie shall not be liable
              for any loss, damage, or dispute arising from: (a) the accuracy or
              completeness of a Listing; (b) an Owner&apos;s authority to list a
              property; (c) interactions, negotiations, or agreements between an
              Owner and a tenant; or (d) an Owner&apos;s failure to comply with
              applicable housing, tenancy, or consumer protection law. This
              limitation applies regardless of the legal theory on which
              liability is asserted.
            </p>
          </div>

          {/* Prohibited Listings */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              5. Prohibited Listings
            </h2>
            <p className="text-muted leading-relaxed">
              You may not publish a Listing that: is fraudulent, duplicated, or
              for a property you do not have the right to list; violates any
              applicable law, including fair housing, anti-discrimination,
              zoning, or short-term rental regulations; contains false,
              exaggerated, or materially misleading information; or infringes a
              third party&apos;s intellectual property or privacy rights. Omamie
              may remove, suspend, or refuse to publish any Listing at its sole
              discretion, with or without notice.
            </p>
          </div>

          {/* Removal and Suspension */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              6. Removal and Suspension of Listings
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie reserves the right to edit, unpublish, suspend, or delete
              any Listing that it reasonably believes violates these Listing
              Terms, the general Terms of Service, or applicable law, or that
              has been reported as inaccurate or fraudulent, without prior
              notice and without liability to the Owner.
            </p>
          </div>

          {/* Changes to Listing Terms */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              7. Changes to these Listing Terms
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie may update these Listing Terms from time to time. We will
              post the updated version on this page with a revised &quot;Last
              Updated&quot; date. Continuing to list or maintain a property on
              the Platform after changes take effect constitutes acceptance of
              the updated Listing Terms.
            </p>
          </div>

          {/* Governing Law */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">8. Governing Law</h2>
            <p className="text-muted leading-relaxed">
              These Listing Terms are governed by the laws of Thailand and are
              subject to the same governing law and dispute resolution terms set
              out in Omamie&apos;s general{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">9. Contact Us</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about these Listing Terms, please contact us
              at{" "}
              <a
                href="mailto:omamieinfo@gmail.com"
                className="text-primary hover:underline"
              >
                omamieinfo@gmail.com
              </a>
              .
            </p>
          </div>

          <p className="text-muted border-hairline-soft border-t pt-4 text-xs leading-relaxed">
            This page is a draft template and has not been reviewed by a lawyer.
            It should be reviewed and approved by qualified legal counsel before
            Omamie relies on it for legal protection.
          </p>
        </div>
      </Section>
    </main>
  );
}
