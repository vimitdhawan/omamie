import Link from "next/link";
import { Home } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-canvas/95 border-hairline fixed top-0 right-0 left-0 z-50 h-20 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Omamie Home"
        >
          <Home className="text-primary h-6 w-6" />
          <span className="text-primary text-xl font-bold">Omamie</span>
        </Link>
      </div>
    </header>
  );
}
