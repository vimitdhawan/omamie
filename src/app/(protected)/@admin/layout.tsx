import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="bg-muted/30 flex-1">
        <div className="container mx-auto px-8 py-6">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
