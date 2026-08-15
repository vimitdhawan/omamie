import Link from "next/link";
import Image from "next/image";

import { ContactForm } from "@/features/contact/components/contact-form";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50/50 px-8 py-8 pb-12">
        {/* Back to Home - Outside grid for better positioning */}
        <div className="mb-6">
          <Link
            href="/"
            className="group text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] leading-none transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            Back to Home
          </Link>
        </div>

        <div className="grid items-stretch sm:grid-cols-1 lg:grid-cols-[9fr_11fr] lg:gap-12">
          {/* Left: Image Section - Same height as form */}
          <div className="hidden flex-col lg:flex">
            <Card className="relative flex-1 overflow-hidden border-gray-200 p-0 shadow-lg">
              {/* Image with contain fit */}
              <div className="relative flex h-full w-full items-center justify-center bg-gray-100">
                <Image
                  src="/images/apartment-interior.jpg"
                  alt="Modern apartment interior"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-10 right-8 left-8 text-white">
                  <h2 className="mb-3 text-3xl font-bold">
                    Find Your Perfect Space
                  </h2>
                  <p className="text-lg opacity-90">
                    Experience premium property management with Omamie&apos;s
                    curated listings.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Form Section - Stretches to match image height */}
          <div className="flex flex-col">
            <ContactForm />
          </div>
        </div>
      </main>
    </>
  );
}
