import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Omamie Privacy Policy &mdash; how we collect and protect your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "2026-08-30";

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Section>
        <SectionHeader title="Privacy Policy" />

        <div className="mx-auto max-w-3xl space-y-6 text-sm">
          <p className="text-muted">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>

          <p className="text-muted leading-relaxed">
            Omamie (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or
            &quot;Company&quot;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and otherwise
            process your personal information.
          </p>

          {/* Information We Collect */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              Information We Collect
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="text-ink font-semibold">From Tenants</h3>
                <p className="text-muted leading-relaxed">
                  When you create an account and submit your rental
                  requirements, we collect:
                </p>
                <ul className="text-muted list-inside list-disc space-y-1 pl-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Preferred rental location and budget</li>
                  <li>Property type and size requirements</li>
                  <li>Number of bedrooms and bathrooms needed</li>
                  <li>Pet requirements and other preferences</li>
                  <li>Move-in timeline</li>
                </ul>
              </div>

              <div>
                <h3 className="text-ink font-semibold">
                  From Property Owners/Agents
                </h3>
                <p className="text-muted leading-relaxed">
                  When you list a property, we collect:
                </p>
                <ul className="text-muted list-inside list-disc space-y-1 pl-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Property location, size, and rental price</li>
                  <li>Number of bedrooms and bathrooms</li>
                  <li>Amenities and property features</li>
                  <li>Property images and descriptions</li>
                  <li>Property-related documents (if any)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-ink font-semibold">From Contact Form</h3>
                <p className="text-muted leading-relaxed">
                  When you contact us via our{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    contact form
                  </a>
                  , we collect your name, email, phone number, and message.
                </p>
              </div>

              <div>
                <h3 className="text-ink font-semibold">
                  Technical Information
                </h3>
                <p className="text-muted leading-relaxed">
                  We may automatically collect information about your device and
                  browsing activity, such as IP address, browser type, pages
                  visited, and timestamps.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              How We Use Your Information
            </h2>
            <p className="text-muted leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="text-muted list-inside list-disc space-y-1 pl-2">
              <li>Perform property and tenant matching</li>
              <li>
                Facilitate introductions between tenants and owners/agents
              </li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>
                Send you updates about matched properties or tenant profiles
              </li>
              <li>Improve and optimize our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          {/* Data Storage and Security */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              Data Storage and Security
            </h2>
            <p className="text-muted leading-relaxed">
              Your information is stored on secure servers. We implement
              industry-standard security measures to protect your data from
              unauthorized access, alteration, disclosure, or destruction.
              However, no transmission over the internet or electronic storage
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>

          {/* Data Sharing */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">Data Sharing</h2>
            <p className="text-muted leading-relaxed">
              We do not sell, rent, or trade your personal information to third
              parties. We may share your information with property owners/agents
              and tenants when we believe a match exists and both parties have
              consented to the introduction. We may also disclose information
              when required by law or to protect our legal rights.
            </p>
          </div>

          {/* Your Rights */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">Your Rights</h2>
            <p className="text-muted leading-relaxed">You have the right to:</p>
            <ul className="text-muted list-inside list-disc space-y-1 pl-2">
              <li>
                Request access to the personal information we hold about you
              </li>
              <li>Request correction of inaccurate information</li>
              <li>
                Request deletion of your information (subject to legal
                obligations)
              </li>
              <li>Opt out of promotional communications</li>
            </ul>
            <p className="text-muted mt-3 leading-relaxed">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:omamieinfo@gmail.com"
                className="text-primary hover:underline"
              >
                omamieinfo@gmail.com
              </a>
              .
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              Changes to This Privacy Policy
            </h2>
            <p className="text-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              our website with an updated &quot;Last Updated&quot; date. Your
              continued use of our platform constitutes acceptance of the
              updated Privacy Policy.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">Contact Us</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at{" "}
              <a
                href="mailto:omamieinfo@gmail.com"
                className="text-primary hover:underline"
              >
                omamieinfo@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
