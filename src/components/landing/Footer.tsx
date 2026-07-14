"use client";

import Link from "next/link";
import { Home, Globe, ChevronDown } from "lucide-react";

const footerLinks = {
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Cancellation Options", href: "#" },
    { label: "Neighborhoods", href: "#" },
  ],
  Hosting: [
    { label: "List Your Property", href: "#" },
    { label: "Host Resources", href: "#" },
    { label: "Community Forum", href: "#" },
    { label: "Host Guarantee", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-canvas border-hairline overflow-x-hidden border-t px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Footer Columns */}
        <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Column 1: Brand + Support */}
          <div className="space-y-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Omamie Home"
            >
              <Home className="text-primary h-5 w-5" />
              <span className="text-primary text-lg font-bold">Omamie</span>
            </Link>
            <p className="text-muted max-w-xs text-sm leading-relaxed">
              Helping property owners and tenants find the right match through
              smart property matching.
            </p>
          </div>

          {/* Column 2: Hosting */}
          <div className="space-y-4">
            <h4 className="text-ink text-sm font-semibold tracking-wider uppercase">
              Hosting
            </h4>
            <ul className="space-y-3">
              {footerLinks.Hosting.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="text-ink text-sm font-semibold tracking-wider uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Band */}
        <div className="border-hairline-soft flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-soft text-sm">
            &copy; {new Date().getFullYear()} Omamie. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="#"
              className="text-muted hover:text-primary text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-muted hover:text-primary text-sm transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-muted hover:text-primary text-sm transition-colors"
            >
              Sitemap
            </Link>
            <div className="flex cursor-pointer items-center gap-2">
              <Globe className="text-muted h-4 w-4" />
              <span className="text-muted text-sm">English (US)</span>
              <ChevronDown className="text-muted h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
