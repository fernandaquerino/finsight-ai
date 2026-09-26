"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/app/MobileSidebar";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import type { Notification } from "@/components/app/NotificationsPanel";
import type { UserMenuUser } from "@/components/app/UserMenu/UserMenuClient";
import { getRouteTitle } from "@/lib/app-routes";

type AppShellProps = Readonly<{
  children: ReactNode;
  user?: UserMenuUser | null;
  // Estado do app resolvido no servidor (layout autenticado): quais rotas têm
  // algo pendente e o que mostrar na central de notificações. O shell só
  // distribui — não busca nada por conta própria.
  indicatorRoutes?: readonly string[];
  notifications?: readonly Notification[];
}>;

function AppShell({
  children,
  user,
  indicatorRoutes,
  notifications,
}: AppShellProps) {
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
      <Sidebar
        pathname={pathname}
        isCollapsed={isCollapsed}
        indicatorRoutes={indicatorRoutes}
      />

      <MobileSidebar
        open={isMobileOpen}
        pathname={pathname}
        onOpenChange={setIsMobileOpen}
        indicatorRoutes={indicatorRoutes}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          onMenuClick={handleMenuClick}
          user={user}
          notifications={notifications}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export { AppShell };
