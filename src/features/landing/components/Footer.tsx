import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-surface-soft border-hairline flex w-full flex-col items-center justify-between gap-[var(--sp-base)] border-t px-[var(--sp-lg)] py-[var(--sp-xl)] md:flex-row">
      <div className="flex items-center gap-[var(--sp-sm)]">
        <Logo className="h-6 w-auto" />
        <p className="font-caption text-caption text-muted-soft">
          © 2024 Omamie Property Marketplace. All rights reserved.
        </p>
      </div>
      <div className="flex gap-[var(--sp-base)]">
        <Link
          href="/privacy"
          className="font-caption text-caption text-muted-soft hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
