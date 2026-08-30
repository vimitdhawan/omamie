import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AgentOwnerDefault() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-foreground text-6xl font-bold tracking-tighter sm:text-7xl">
          404
        </h1>
        <h2 className="text-muted-foreground text-2xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-muted-foreground max-w-[400px] md:text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Link href="/" className={buttonVariants({ variant: "link" })}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
