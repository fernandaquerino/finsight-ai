"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/app/MobileSidebar";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import type { UserMenuUser } from "@/components/app/UserMenu/UserMenuClient";
import { getRouteTitle } from "@/lib/app-routes";

type AppShellProps = Readonly<{
  children: ReactNode;
  user?: UserMenuUser | null;
}>;

function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const title = getRouteTitle(pathname);

  function handleMenuClick() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsCollapsed((current) => !current);
      return;
    }

    setIsMobileOpen(true);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar pathname={pathname} isCollapsed={isCollapsed} />

      <MobileSidebar
        open={isMobileOpen}
        pathname={pathname}
        onOpenChange={setIsMobileOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={handleMenuClick} user={user} />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export { AppShell };
