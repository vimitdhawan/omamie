import Link from "next/link";
import Image from "next/image";

import Footer from "@/features/landing/components/Footer";
import Header from "@/features/landing/components/Header";
import { ContactForm } from "@/features/contact/components/contact-form";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_3fr] lg:gap-12">
            {/* Left: Image Section (40%) - Matches card height */}
            <div className="order-2 lg:order-1">
              <Card className="relative h-full min-h-[400px] overflow-hidden border-gray-200 p-0 shadow-lg">
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
              </Card>
            </div>

            {/* Right: Form Section (60%) in Card */}
            <div className="order-1 lg:order-2">
              <Card className="border-gray-200 bg-white p-8 shadow-lg sm:p-10">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900">
                    Contact Us
                  </h1>
                  <p className="mt-3 text-lg text-gray-600">
                    We&apos;re here to help with any questions about listings,
                    partnerships, or property management.
                  </p>
                </div>

                <ContactForm />
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
