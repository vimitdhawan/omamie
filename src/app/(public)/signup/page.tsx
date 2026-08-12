import { redirect } from "next/navigation";
import { SignupForm } from "@/features/auth/components/signup-form";
import { IntentStep } from "@/features/auth/components/intent-step";
import { RoleStep } from "@/features/auth/components/role-step";

export const dynamic = "force-dynamic";

interface SignupSearchParams {
  intent?: string;
  role?: string;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SignupSearchParams>;
}) {
  const { intent, role } = await searchParams;

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

  // Step 3: List Property without role → show role selection
  if (intent === "list-property" && !role) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8 pt-20">
        <RoleStep />
      </main>
    );
  }

  // Step 4: List Property with valid role → show form
  if (intent === "list-property" && (role === "agent" || role === "owner")) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8 pt-20">
        <SignupForm role={role as "agent" | "owner"} />
      </main>
    );
  }

  // Invalid combination → redirect to first step
  redirect("/signup");
}
