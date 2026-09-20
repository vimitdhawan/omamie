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
import { LayoutDashboard, Building2, Users, ClipboardList } from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "Properties",
    href: "/properties",
    icon: <Building2 className="size-4" />,
  },
  {
    label: "Users",
    href: "/users",
    icon: <Users className="size-4" />,
  },
  {
    label: "Requests",
    href: "/requests",
    icon: <ClipboardList className="size-4" />,
  },
];

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, profile } = await getCurrentUser();

  const userData = {
    name: profile?.full_name || user?.user_metadata?.full_name || "Admin",
    email: user?.email || "admin@omamie.local",
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-4 pt-4 pb-2">
        <Logo className="h-8 w-auto" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
