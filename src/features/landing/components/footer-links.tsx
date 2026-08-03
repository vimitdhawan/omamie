"use client";

import Link from "next/link";

interface FooterLinksProps {
  title: string;
  links: { label: string; href: string }[];
}

export function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-ink text-xs font-semibold tracking-wider uppercase">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-muted hover:text-primary text-xs transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
