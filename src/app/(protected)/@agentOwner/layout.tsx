import { AppSidebar } from "@/components/custom/app-sidebar";
import { AppTopbar } from "@/components/custom/app-topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AgentOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
