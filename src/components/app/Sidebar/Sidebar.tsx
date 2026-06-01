"use client";

import { Logo } from "@/components/app/Icons";
import { SidebarNavItem } from "@/components/app/SidebarNavItem";
import { cn } from "@/lib/utils";
import {
  isActiveRoute,
  settingsRoute,
  sidebarRouteGroups,
} from "@/routes/app-routes";

type SidebarProps = Readonly<{
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}>;

function Sidebar({ pathname, className, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col",
        className,
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Logo className="h-8 w-auto text-foreground" />
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-6 px-3 py-4"
      >
        {sidebarRouteGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.routes.map((route) => (
                <SidebarNavItem
                  key={route.href}
                  route={route}
                  isActive={isActiveRoute(pathname, route.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <SidebarNavItem
          route={settingsRoute}
          isActive={isActiveRoute(pathname, settingsRoute.href)}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}

export { Sidebar };
