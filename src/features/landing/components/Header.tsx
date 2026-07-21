import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function Header() {
  return (
    <header className="border-hairline fixed top-0 right-0 left-0 z-50 h-20 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center px-6 sm:px-8 lg:px-12 xl:px-16">
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
