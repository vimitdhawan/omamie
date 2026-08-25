import { Header } from "@/components/custom/app-header";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
      <Toaster />
    </div>
  );
}
