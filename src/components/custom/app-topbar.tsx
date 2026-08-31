"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppTopbarProps {
  title?: string;
}

const iconButtonClasses =
  "inline-flex size-8 items-center justify-center rounded-lg transition-all hover:bg-muted hover:text-foreground";

export function AppTopbar({ title }: AppTopbarProps) {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden">
          <span className="material-symbols-outlined">menu</span>
        </SidebarTrigger>
        {title && (
          <h2 className="text-foreground text-[21px] leading-tight font-bold">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className={`${iconButtonClasses} relative`}>
          <span className="material-symbols-outlined text-[24px]">
            notifications
          </span>
          <span className="bg-destructive absolute top-2 right-2 h-2 w-2 rounded-full" />
        </Link>

        <Link href="/help" className={iconButtonClasses}>
          <span className="material-symbols-outlined text-[24px]">
            help_outline
          </span>
        </Link>

        <div className="bg-border h-6 w-px" />

        <Link
          href="/settings/profile"
          className={`${iconButtonClasses} rounded-full`}
        >
          <span className="material-symbols-outlined text-[24px]">
            account_circle
          </span>
        </Link>
      </div>
    </header>
  );
}
