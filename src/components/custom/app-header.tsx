import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/custom/logo";
import { logoutAction } from "@/features/auth/actions";

export function Header() {
  return (
    <>
      <header className="bg-surface-soft sticky top-0 z-50 w-full border-b border-gray-100 px-4 md:px-12">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="items-centers flex shrink-0"
              aria-label="Omamie Home"
            >
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-4 md:flex-col">
            <form action={logoutAction}>
              <Button size="default" type="submit" className="cursor-pointer">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
