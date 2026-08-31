import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "FAQ - Help Center",
  description:
    "Frequently asked questions about Omamie, our matching process, and how to get the most from our platform.",
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "How does the matching process work?",
    answer: (
      <p>
        When you submit your requirements (as a tenant) or property details (as
        an owner), our team reviews your submission. We then manually match
        tenant profiles with properties based on location, budget, size,
        amenities, and other criteria. When we find a good match, we connect
        both parties to arrange a viewing and discuss next steps.
      </p>
    ),
  },
  {
    question: "How do I find a property?",
    answer: (
      <p>
        Start by visiting our{" "}
        <Link href="/find-property" className="text-primary hover:underline">
          Find a Property
        </Link>{" "}
        page. You&apos;ll complete a brief profile with your rental requirements
        (location, budget, property size, bedrooms, pet needs, move-in
        timeline). Once submitted, our team will match you with suitable
        properties and reach out to arrange viewings.
      </p>
    ),
  },
  {
    question: "How do I list my property?",
    answer: (
      <p>
        Visit our{" "}
        <Link href="/properties/new" className="text-primary hover:underline">
          List Your Property
        </Link>{" "}
        page to get started. You&apos;ll provide detailed information about your
        property (location, rental price, size, bedrooms, bathrooms, amenities,
        and photos). Once submitted, our team reviews your listing and connects
        you with matched tenant profiles.
      </p>
    ),
  },
  {
    question: "Is there an online booking or payment system?",
    answer: (
      <p>
        Not yet. Omamie is currently in the early stages, focused on connecting
        tenants with properties and facilitating initial conversations. Viewings
        are arranged directly between you and the property owner/agent, or with
        platform assistance. Rent payment, lease signing, and related logistics
        are handled directly between tenant and owner.
      </p>
    ),
  },
  {
    question: "Can I cancel or change my listing/requirements?",
    answer: (
      <p>
        Yes. Please reach out to us via our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact
        </Link>{" "}
        page or email us at{" "}
        <a
          href="mailto:omamieinfo@gmail.com"
          className="text-primary hover:underline"
        >
          omamieinfo@gmail.com
        </a>
        . Our team will help you update or remove your information as needed.
      </p>
    ),
  },
  {
    question: "How is my data handled and protected?",
    answer: (
      <p>
        We collect and store your information to perform matching and respond to
        inquiries. Your data is never sold to third parties. For detailed
        information about how we collect, use, and protect your personal data,
        please review our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    ),
  },
  {
    question: "I still need help. How do I contact support?",
    answer: (
      <p>
        Visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact
        </Link>{" "}
        page to reach out to our team. You can also email us directly at{" "}
        <a
          href="mailto:omamieinfo@gmail.com"
          className="text-primary hover:underline"
        >
          omamieinfo@gmail.com
        </a>
        . We&apos;re here to help.
      </p>
    ),
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Section>
        <SectionHeader
          title="How can we help?"
          subtitle="Find answers to common questions about Omamie"
        />

        <div className="mx-auto max-w-2xl space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="border-hairline group hover:bg-surface-soft rounded-lg border px-4 py-3 transition-colors"
            >
              <summary className="text-ink cursor-pointer text-sm font-medium select-none">
                {faq.question}
              </summary>
              <div className="text-muted mt-3 space-y-2 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}

          {/* Contact CTA */}
          <div className="border-hairline-soft bg-surface-soft mt-8 rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted text-sm">
              Can&apos;t find the answer you&apos;re looking for?
            </p>
            <Link
              href="/contact"
              className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
            >
              Get in touch with our team
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
