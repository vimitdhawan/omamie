"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/custom/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/features/auth/actions";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
} from "lucide-react";
import type { Profile } from "@/features/profile/types";
import { USER_ROLES } from "@/features/auth/schema";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/properties",
    enabled: true,
  },
  { label: "Properties", icon: Building2, href: "/properties", enabled: true },
  { label: "Tenants", icon: Users, href: null, enabled: false },
  { label: "Leases", icon: FileText, href: null, enabled: false },
  { label: "Payments", icon: CreditCard, href: null, enabled: false },
  { label: "Messages", icon: MessageSquare, href: null, enabled: false },
  { label: "Settings", icon: Settings, href: null, enabled: false },
];

interface SidebarProps {
  profile: Profile;
}

function SidebarBrand() {
  return (
    <div className="flex h-16 items-center gap-2.5 px-5">
      <Logo className="h-8 w-auto" />
    </div>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.enabled && pathname.startsWith(item.href || "");

        if (!item.enabled) {
          return (
            <div
              key={item.label}
              className="text-muted-foreground/40 pointer-events-none flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-surface-soft text-foreground"
                : "text-muted-foreground hover:bg-surface-soft/60 hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarProfile({ profile }: { profile: Profile }) {
  const handleLogout = useCallback(async () => {
    await logoutAction();
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 border-t border-gray-100 p-4">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="bg-surface-soft text-foreground text-xs font-semibold">
          {getInitials(profile.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm font-medium">
          {profile.full_name || "User"}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {profile.email}
        </p>
        {profile.role && (
          <p className="text-muted-foreground truncate text-xs capitalize">
            {USER_ROLES[profile.role as keyof typeof USER_ROLES]}
          </p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="hover:bg-surface-soft ml-auto inline-flex items-center gap-1 rounded-lg p-1.5 transition-colors"
        aria-label="Logout"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function SidebarContent({ profile }: SidebarProps) {
  return (
    <>
      <SidebarBrand />
      <SidebarNav />
      <SidebarProfile profile={profile} />
    </>
  );
}

function DesktopSidebar({ profile }: SidebarProps) {
  return (
    <aside className="bg-surface-soft sticky top-0 hidden h-svh w-64 flex-col border-r border-gray-100 lg:flex">
      <SidebarContent profile={profile} />
    </aside>
  );
}

function MobileSidebar({ profile }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden" onClick={() => setOpen(!open)}>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent profile={profile} />
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar({ profile }: SidebarProps) {
  return (
    <>
      <DesktopSidebar profile={profile} />
      <MobileSidebar profile={profile} />
    </>
  );
}
