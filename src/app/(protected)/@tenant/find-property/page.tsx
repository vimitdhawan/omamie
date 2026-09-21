import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getOwnRequirementsAction } from "@/features/requirements/actions";
import { RequirementsForm } from "@/features/requirements/components/requirements-form";

export const dynamic = "force-dynamic";

export default async function FindPropertyPage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const { profile, requirements } = await getOwnRequirementsAction();

  return (
    <main className="flex-1 bg-white px-4 pt-8 pb-12">
      <div className="mx-auto max-w-[720px]">
        <RequirementsForm
          initialProfile={profile}
          initialRequirements={requirements}
        />
      </div>
    </main>
  );
}
