import Link from "next/link";
import { Logo } from "./logo";

export function TenantFooter() {
  return (
    <footer className="mt-auto w-full border-t border-gray-100 bg-gray-50 py-12">
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center">
            <Logo className="h-6 w-auto" />
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-primary text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary text-gray-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="hover:text-primary text-gray-600 transition-colors"
            >
              Cookie Settings
            </Link>
            <Link
              href="/contact"
              className="hover:text-primary text-gray-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Omamie Property Management. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
