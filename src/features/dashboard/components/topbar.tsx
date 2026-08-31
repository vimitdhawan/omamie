"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, MousePointer } from "lucide-react";
import { SidebarContent } from "./sidebar";
import type { Profile } from "@/features/profile/types";

interface TopbarProps {
  profile: Profile;
}

function getPageInfo(pathname: string) {
  if (pathname === "/properties") {
    return {
      title: "Properties",
      subtitle: "Manage and view your property listings",
      showAddButton: true,
    };
  }
  if (pathname === "/properties/new") {
    return {
      title: "Add Property",
      subtitle: "List a new property",
      showAddButton: false,
    };
  }
  if (pathname.match(/^\/properties\/[^/]+$/)) {
    return {
      title: "Edit Property",
      subtitle: "Update your property listing",
      showAddButton: false,
    };
  }
  return {
    title: "Properties",
    subtitle: "",
    showAddButton: false,
  };
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <header className="bg-surface-soft/80 sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-gray-100 px-4 backdrop-blur-md lg:px-6">
      <Sheet>
        <SheetTrigger className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent profile={profile} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight">
          {pageInfo.title}
        </h1>
        {pageInfo.subtitle && (
          <p className="text-muted-foreground hidden text-sm sm:block">
            {pageInfo.subtitle}
          </p>
        )}
      </div>

      {pageInfo.showAddButton && (
        <Link href="/properties/new" className="ml-auto">
          <Button size="sm" className="cursor-pointer gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Property</span>
            <MousePointer className="size-4" />
          </Button>
        </Link>
      )}
    </header>
  );
}
