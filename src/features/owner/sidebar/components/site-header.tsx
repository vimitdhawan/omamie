"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeTitleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/properties": "Manage Properties",
  "/matches": "Matches",
  "/tenants": "Tenants",
  "/settings": "Settings",
};

export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    for (const [route, title] of Object.entries(routeTitleMap)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        return title;
      }
    }
    return "Dashboard";
  };

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-foreground text-lg font-semibold">
          {getPageTitle()}
        </h1>
      </div>
    </header>
  );
}
