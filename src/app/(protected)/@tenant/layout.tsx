import { TenantNav } from "@/components/custom/tenant-nav";
import { TenantFooter } from "@/components/custom/tenant-footer";
import { Toaster } from "@/components/ui/sonner";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TenantNav />
      <main className="flex-1">{children}</main>
      <TenantFooter />
      <Toaster />
    </div>
  );
}
