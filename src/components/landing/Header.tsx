import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function Header() {
  return (
    <header className="bg-canvas border-hairline fixed top-0 right-0 left-0 z-50 h-16 border-b">
      <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Omamie Home"
        >
          <Logo className="h-8 w-auto" />
        </Link>
      </div>
    </header>
  );
}
