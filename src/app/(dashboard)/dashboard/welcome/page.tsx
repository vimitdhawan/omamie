import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-ink mb-4 text-3xl font-bold">
            Property Listed Successfully!
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your property has been listed and is now visible to potential
            tenants.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/dashboard/properties">
            <Button size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-5 w-5"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/properties/new">
            <Button variant="outline" size="lg">
              List Another Property
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
