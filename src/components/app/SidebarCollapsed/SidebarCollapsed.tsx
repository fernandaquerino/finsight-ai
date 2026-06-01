"use client";

import { LogoMark } from "@/components/app/Icons";
import { SidebarNavItem } from "@/components/app/SidebarNavItem";
import {
  isActiveRoute,
  settingsRoute,
  sidebarRouteGroups,
} from "@/routes/app-routes";

type SidebarCollapsedProps = Readonly<{
  pathname: string;
}>;

function SidebarCollapsed({ pathname }: SidebarCollapsedProps) {
  return (
    <aside className="hidden w-16 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-14 items-center justify-center border-b px-2">
        <LogoMark className="size-8" title="FinSight AI" />
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-6 px-2 py-4"
      >
        {sidebarRouteGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {group.routes.map((route) => (
              <SidebarNavItem
                key={route.href}
                route={route}
                isActive={isActiveRoute(pathname, route.href)}
                isCollapsed
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t px-2 py-3">
        <SidebarNavItem
          route={settingsRoute}
          isActive={isActiveRoute(pathname, settingsRoute.href)}
          isCollapsed
        />
      </div>
    </aside>
  );
}

export { SidebarCollapsed };
