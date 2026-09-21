"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.label}
                  isActive={isActive}
                  className={cn(
                    "relative transition-all duration-200",
                    isActive && [
                      "font-medium",
                      "before:bg-primary before:absolute before:top-1/2 before:left-0 before:h-8 before:w-1 before:-translate-y-1/2 before:rounded-r-md",
                      "after:bg-primary/10 after:absolute after:inset-0 after:rounded-md after:opacity-50 after:transition-opacity",
                      "hover:after:opacity-100",
                    ]
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.badge !== undefined && item.badge > 0 && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
