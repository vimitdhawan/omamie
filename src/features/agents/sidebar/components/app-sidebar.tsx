import { Logo } from "@/components/custom/logo";
import { NavMain } from "@/features/agents/sidebar/components/nav-main";
import { NavUser } from "@/features/agents/sidebar/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/features/auth/service";
import {
  LayoutDashboard,
  Files,
  Calendar,
  Users,
  Settings,
  Plus,
} from "lucide-react";
import Link from "next/link";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "Properties",
    href: "/properties",
    icon: <Files className="size-4" />,
  },
  {
    label: "Matches",
    href: "/matches",
    icon: <Calendar className="size-4" />,
  },
  {
    label: "Tenants",
    href: "/tenants",
    icon: <Users className="size-4" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="size-4" />,
  },
];

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, profile } = await getCurrentUser();

  const userData = {
    name: profile?.full_name || user?.user_metadata?.full_name || "Agent/Owner",
    email: user?.email || "user@omamie.local",
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-4 pt-4 pb-2">
        <Logo className="h-8 w-auto" />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4 pt-2 pb-3">
          <Link
            href="/properties/create"
            className="bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:ring-ring/50 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all focus-visible:ring-2"
          >
            <Plus className="size-4" />
            Create Listing
          </Link>
        </div>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
