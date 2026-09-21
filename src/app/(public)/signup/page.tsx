import { redirect } from "next/navigation";
import { SignupForm } from "@/features/auth/components/signup-form";
import { IntentStep } from "@/features/auth/components/intent-step";

export const dynamic = "force-dynamic";

interface SignupSearchParams {
  intent?: string;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SignupSearchParams>;
}) {
  const { intent } = await searchParams;

  // Step 1: No intent → show intent selection
  if (!intent) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8 pt-20">
        <IntentStep />
      </main>
    );
  }

  // Step 2: Find Property → go straight to form with tenant role
  if (intent === "find-property") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8 pt-20">
        <SignupForm role="tenant" />
      </main>
    );
  }

  // Step 3: List Property → go straight to form with owner role. There is
  // only one lister persona today, so no role-selection step is needed.
  if (intent === "list-property") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8 pt-20">
        <SignupForm role="owner" />
      </main>
    );
  }

  // Invalid combination → redirect to first step
  redirect("/signup");
}
