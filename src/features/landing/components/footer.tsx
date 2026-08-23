"use client";

import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";
import { Logo } from "@/components/custom/logo";
import { FooterLinks } from "@/features/landing/components/footer-links";

const footerLinks = {
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Cancellation Options", href: "#" },
    { label: "Neighborhoods", href: "#" },
  ],
  Hosting: [
    { label: "List Your Property", href: "/list-property" },
    { label: "Host Resources", href: "#" },
    { label: "Community Forum", href: "#" },
    { label: "Host Guarantee", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-canvas border-hairline overflow-x-hidden border-t px-6 py-12 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Footer Columns - 4 equal columns */}
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

          {/* Column 2: Support */}
          <FooterLinks title="Support" links={footerLinks.Support} />

          {/* Column 3: Hosting */}
          <FooterLinks title="Hosting" links={footerLinks.Hosting} />

          {/* Column 4: Company */}
          <FooterLinks title="Company" links={footerLinks.Company} />
        </div>

        {/* Legal Band */}
        <div className="border-hairline-soft flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <p className="text-muted-soft text-xs">
            &copy; {new Date().getFullYear()} Omamie. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="#"
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              Sitemap
            </Link>
            <div className="flex cursor-pointer items-center gap-1.5">
              <Globe className="text-muted h-3.5 w-3.5" />
              <span className="text-muted text-xs">English (US)</span>
              <ChevronDown className="text-muted h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
