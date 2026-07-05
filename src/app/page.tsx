import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/" className="text-lg font-semibold">
            Omamie
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost" })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "default" })}
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Omamie,
          <br />
          Simplified.
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Find properties, manage listings, and connect tenants with owners and
          agents — all in one place.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Get started
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Log in
          </Link>
        </div>
      </main>

      <footer className="text-muted-foreground border-t py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Omamie. All rights reserved.
      </footer>
    </div>
  );
}
