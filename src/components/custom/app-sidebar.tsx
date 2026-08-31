"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/features/auth/actions";

interface AppSidebarProps {
  pendingRequestsCount?: number;
}

const getNavigation = (pendingCount: number = 0) => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Properties",
    href: "/properties",
    icon: "domain",
  },
  {
    label: "Viewing Requests",
    href: "/viewing-requests",
    icon: "calendar_today",
    badge: pendingCount,
  },
  {
    label: "Availability",
    href: "/availability",
    icon: "event_available",
  },
  {
    label: "Tenants",
    href: "/tenants",
    icon: "groups",
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: "build",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
  },
];

export function AppSidebar({ pendingRequestsCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigation(pendingRequestsCount);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="mb-xl px-sm">
          <h1 className="text-primary dark:text-primary-fixed text-[22px] leading-tight font-bold tracking-[-0.44px]">
            Omamie
          </h1>
          <p className="mt-xs text-muted-foreground text-[13px] leading-tight">
            Management Portal
          </p>
        </div>

        <div className="px-2">
          <Link
            href="/properties/create"
            className="bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-medium transition-all focus-visible:ring-3"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="group-data-[collapsible=icon]:hidden">
              Add Property
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isActive ? "font-variation-settings-['FILL'_1]" : ""
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-primary text-primary-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  <span>Log Out</span>
                </button>
              </form>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
