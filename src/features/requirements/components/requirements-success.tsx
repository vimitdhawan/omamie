import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function RequirementsSuccess() {
  return (
    <Card className="bg-surface-soft/50 border-gray-200">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">You&apos;re All Set! 🎉</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            We&apos;ve saved your details and requirements. Owners reviewing
            your requests will see this instead of your contact details.
          </p>
        </div>
        <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <a href="/matches" className={buttonVariants({ variant: "default" })}>
            View My Requests
          </a>
          <a
            href="/find-property"
            className={buttonVariants({ variant: "secondary" })}
          >
            Edit My Details
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
