"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/app/MobileSidebar";
import { Sidebar } from "@/components/app/Sidebar";
import { SidebarCollapsed } from "@/components/app/SidebarCollapsed";
import { Topbar } from "@/components/app/Topbar";
import { getRouteTitle } from "@/routes/app-routes";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

function AppShell({ children }: AppShellProps) {
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
      {isCollapsed ? (
        <SidebarCollapsed pathname={pathname} />
      ) : (
        <Sidebar pathname={pathname} />
      )}

      <MobileSidebar
        open={isMobileOpen}
        pathname={pathname}
        onOpenChange={setIsMobileOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={handleMenuClick} />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export { AppShell };
