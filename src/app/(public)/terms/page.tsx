import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Omamie Terms of Service &mdash; legal terms and conditions of use.",
};

export default function TermsPage() {
  const lastUpdated = "2026-08-30";

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Section>
        <SectionHeader title="Terms of Service" />

        <div className="mx-auto max-w-3xl space-y-6 text-sm">
          <p className="text-muted">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>

          <p className="text-muted leading-relaxed">
            Please read these Terms of Service (&quot;Terms&quot;) carefully
            before using the Omamie platform (&quot;Platform&quot;) operated by
            Omamie (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;). By accessing or using our Platform, you agree to
            be bound by these Terms. If you do not agree to these Terms, do not
            use the Platform.
          </p>

          {/* Acceptance of Terms */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted leading-relaxed">
              By accessing and using Omamie, you accept and agree to be bound by
              and comply with these Terms and all applicable laws and
              regulations. If you do not agree to these Terms, please do not use
              the Platform.
            </p>
          </div>

          {/* Description of Service */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              2. Description of Service
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie is a property matching platform that facilitates
              connections between tenants seeking rental properties and property
              owners/agents with available properties. Omamie is not a licensed
              real estate broker or agent. We do not directly manage properties,
              collect rent, handle lease agreements, or provide real estate
              advice. Tenants and property owners are responsible for arranging
              viewings, negotiating terms, and executing rental agreements
              independently.
            </p>
          </div>

          {/* User Responsibilities */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              3. User Responsibilities
            </h2>
            <p className="text-muted leading-relaxed">Users agree to:</p>
            <ul className="text-muted list-inside list-disc space-y-1 pl-2">
              <li>Provide accurate, complete, and truthful information</li>
              <li>
                Comply with all applicable laws and regulations in your
                jurisdiction
              </li>
              <li>Not use the Platform for illegal or unauthorized purposes</li>
              <li>
                Not engage in fraud, misrepresentation, or deceptive practices
              </li>
              <li>
                Respect the rights and privacy of other users on the Platform
              </li>
              <li>
                Not harass, threaten, defame, or otherwise harm other users
              </li>
            </ul>
          </div>

          {/* No Guarantee of Match or Tenancy */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              4. No Guarantee of Match or Tenancy
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie matches tenant profiles with properties based on submitted
              criteria, but we make no guarantee that:
            </p>
            <ul className="text-muted list-inside list-disc space-y-1 pl-2">
              <li>A suitable match will be found</li>
              <li>Matches will result in viewings or applications</li>
              <li>A tenancy will be successfully arranged</li>
              <li>
                Property information provided by owners is accurate or current
              </li>
            </ul>
            <p className="text-muted mt-3 leading-relaxed">
              All information provided on the Platform is provided
              &quot;as-is&quot; without warranty of any kind. Users are
              responsible for verifying information and conducting due diligence
              before making rental decisions.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              5. Limitation of Liability
            </h2>
            <p className="text-muted leading-relaxed">
              To the fullest extent permitted by law, Omamie shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Platform, including but not
              limited to loss of revenue, loss of profits, loss of data, or
              business interruption, even if Omamie has been advised of the
              possibility of such damages.
            </p>
          </div>

          {/* Termination of Account */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              6. Termination of Account
            </h2>
            <p className="text-muted leading-relaxed">
              Omamie reserves the right to suspend or terminate your account at
              any time, with or without cause, and with or without notice.
              Reasons for termination may include, but are not limited to,
              violation of these Terms, fraudulent activity, or illegal conduct.
              Upon termination, your right to use the Platform ceases
              immediately.
            </p>
          </div>

          {/* Intellectual Property */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              7. Intellectual Property
            </h2>
            <p className="text-muted leading-relaxed">
              All content, design, text, graphics, images, and other materials
              on the Platform are the property of Omamie or its licensors and
              are protected by copyright and other intellectual property laws.
              You may not reproduce, distribute, or transmit any content without
              our prior written consent.
            </p>
          </div>

          {/* User-Generated Content */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              8. User-Generated Content
            </h2>
            <p className="text-muted leading-relaxed">
              By submitting information to Omamie, you grant us a non-exclusive,
              royalty-free license to use that information for matching
              purposes, improving our services, and as otherwise permitted by
              our Privacy Policy.
            </p>
          </div>

          {/* Governing Law */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">9. Governing Law</h2>
            <p className="text-muted leading-relaxed">
              These Terms are governed by and construed in accordance with the
              laws of Thailand, without regard to its conflict of law
              principles. You agree to submit to the exclusive jurisdiction of
              the courts located in Thailand for the resolution of any disputes
              arising from these Terms or your use of the Platform.
            </p>
          </div>

          {/* Dispute Resolution */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">
              10. Dispute Resolution
            </h2>
            <p className="text-muted leading-relaxed">
              Any dispute arising from these Terms or your use of the Platform
              shall be resolved through binding arbitration or litigation in the
              courts of Thailand, at Omamie&apos;s sole discretion. You agree to
              waive your right to a jury trial.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">11. Changes to Terms</h2>
            <p className="text-muted leading-relaxed">
              Omamie may modify these Terms at any time. We will notify you of
              material changes by posting the updated Terms on our website with
              an updated &quot;Last Updated&quot; date. Your continued use of
              the Platform constitutes acceptance of the updated Terms.
            </p>
          </div>

          {/* Entire Agreement */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">12. Entire Agreement</h2>
            <p className="text-muted leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and Omamie regarding your use of the
              Platform and supersede all prior negotiations, representations,
              and agreements.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-ink text-lg font-bold">13. Contact Us</h2>
            <p className="text-muted leading-relaxed">
              If you have questions about these Terms of Service, please contact
              us at{" "}
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
