import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import Footer from "@/features/landing/components/Footer";
import Header from "@/features/landing/components/Header";
import { ContactForm } from "@/features/contact/components/contact-form";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-[var(--sp-base)] pt-28 pb-[var(--sp-section)] md:px-[var(--sp-xxl)] lg:px-[var(--sp-section)]">
        <div className="flex flex-col items-start gap-[var(--sp-xxl)] md:flex-row">
          {/* Left panel: professional image */}
          <div className="relative w-full md:w-1/2">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src="/images/apartment-interior.jpg"
                alt="Modern apartment interior"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-[var(--sp-lg)] left-[var(--sp-lg)] right-[var(--sp-lg)] text-white">
                <h2 className="text-ink mb-[var(--sp-sm)] text-2xl font-bold text-white sm:text-3xl">
                  Find Your Perfect Space
                </h2>
                <p className="max-w-sm text-sm opacity-90 sm:text-base">
                  Experience the next generation of property discovery with
                  Omamie&apos;s curated high-end listings.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: contact form */}
          <div className="w-full md:w-1/2">
            {/* Back link */}
            <div className="mb-[var(--sp-lg)]">
              <Link
                href="/"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-[var(--sp-sm)] text-sm transition-colors"
              >
                <ArrowLeft className="h-[18px] w-[18px] leading-none" />
                Back to Home
              </Link>
            </div>

            <div className="mb-[var(--sp-xl)]">
              <h1 className="text-ink mb-[var(--sp-sm)] text-2xl font-bold sm:text-3xl">
                Contact Us
              </h1>
              <p className="text-muted text-sm sm:text-base">
                We&apos;re here to help. Reach out with any questions about
                listings, partnerships, or just to say hello.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
