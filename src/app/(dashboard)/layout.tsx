import { getCurrentUser } from "@/features/auth/service";
import { redirect } from "next/navigation";
import { Header } from "@/components/custom/app-header";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
      <Toaster />
    </div>
  );
}
