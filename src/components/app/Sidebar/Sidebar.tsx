"use client";

import { Logo, LogoMark } from "@/components/app/Icons";
import { SidebarNavItem } from "@/components/app/SidebarNavItem";
import { cn } from "@/lib/utils";
import {
  isActiveRoute,
  settingsRoute,
  sidebarRouteGroups,
} from "@/lib/app-routes";

type SidebarProps = Readonly<{
  pathname: string;
  className?: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}>;

function Sidebar({
  pathname,
  className,
  isCollapsed = false,
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-hidden border-r bg-card md:flex md:flex-col",
        "transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b transition-[padding] duration-300",
          isCollapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {isCollapsed ? (
          <LogoMark className="size-8" title="FinSight AI" />
        ) : (
          <Logo className="h-8 w-auto text-foreground" />
        )}
      </div>

      <nav
        aria-label="Navegação principal"
        className={cn(
          "flex-1 space-y-6 py-4 transition-[padding] duration-300",
          isCollapsed ? "px-2" : "px-3",
        )}
      >
        {sidebarRouteGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!isCollapsed && (
              <p className="px-3 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.routes.map((route) => (
                <SidebarNavItem
                  key={route.href}
                  route={route}
                  isActive={isActiveRoute(pathname, route.href)}
                  isCollapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "border-t transition-[padding] duration-300",
          isCollapsed ? "px-2 py-3" : "p-3",
        )}
      >
        <SidebarNavItem
          route={settingsRoute}
          isActive={isActiveRoute(pathname, settingsRoute.href)}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}

export { Sidebar };
