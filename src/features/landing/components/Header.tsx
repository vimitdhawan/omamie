import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

export default function Navbar() {
  return (
    <>
      <header className="bg-background/95 sticky top-0 z-50 w-full border-b border-gray-100 px-4 md:px-12">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Omamie Home"
            >
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-4 md:flex-col">
            <Button size="sm">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
