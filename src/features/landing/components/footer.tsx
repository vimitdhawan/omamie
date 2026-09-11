"use client";

import Link from "next/link";
import { Logo } from "@/components/custom/logo";
import { FooterLinks } from "@/features/landing/components/footer-links";
import { FooterSocialLinks } from "@/features/landing/components/footer-social-links";

const footerLinks = {
  "Get Started": [
    { label: "Find a Property", href: "/find-property" },
    { label: "List Your Property", href: "/properties/create" },
    { label: "FAQ", href: "/help" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-canvas border-hairline overflow-x-hidden border-t px-6 py-12 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Footer Columns - Brand + 3 sections + Social */}
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-10">
          {/* Column 1: Brand + Tagline */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center"
              aria-label="Omamie Home"
            >
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-muted max-w-xs text-xs leading-relaxed">
              Helping property owners and tenants find the right match through
              smart property matching.
            </p>
          </div>

          {/* Column 2: Get Started */}
          <FooterLinks title="Get Started" links={footerLinks["Get Started"]} />

          {/* Column 3: Company */}
          <FooterLinks title="Company" links={footerLinks.Company} />

          {/* Column 4: Social Links */}
          <FooterSocialLinks />
        </div>

        {/* Legal Band */}
        <div className="border-hairline-soft flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <p className="text-muted-soft text-xs">
            &copy; {new Date().getFullYear()} Omamie. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/privacy"
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
