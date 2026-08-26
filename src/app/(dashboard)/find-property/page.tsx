import { FindPropertyForm } from "@/features/find-property/components/find-property-form";

export const dynamic = "force-dynamic";

export default function FindPropertyPage() {
  return (
    <main className="flex-1 bg-white px-4 pt-8 pb-12">
      <div className="mx-auto max-w-[720px]">
        <FindPropertyForm />
      </div>
    </main>
  );
}
