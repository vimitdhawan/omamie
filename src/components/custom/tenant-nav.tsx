"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

export function TenantNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Explore", href: "/browse-properties" },
    { label: "Saved", href: "/saved" },
    { label: "Matches", href: "/matches" },
    { label: "My Rentals", href: "/my-rental" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white px-4 md:px-12">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link
            href="/browse-properties"
            className="flex shrink-0 items-center"
          >
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "border-primary text-primary border-b-2 pb-1"
                  : "text-gray-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hover:text-primary hidden text-sm font-medium text-gray-600 transition-colors md:block"
          >
            Support
          </Link>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">Tenant</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      My Account
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-requests">My Requests</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved">Saved Properties</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full text-left">
                      Logout
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
