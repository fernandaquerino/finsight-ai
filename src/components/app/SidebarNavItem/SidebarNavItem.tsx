"use client";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import type { AppRoute } from "@/routes/app-routes";

type SidebarNavItemProps = Readonly<{
  route: AppRoute;
  isActive: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}>;

function SidebarNavItem({
  route,
  isActive,
  isCollapsed = false,
  onNavigate,
}: SidebarNavItemProps) {
  const Icon = route.icon;
  const link = (
    <Link
      href={route.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? route.label : undefined}
      onClick={onNavigate}
      className={cn(
        "relative flex h-9 items-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        isCollapsed ? "justify-center px-0" : "gap-3 px-3",
        isActive
          ? "bg-primary-soft text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {!isCollapsed && <span>{route.label}</span>}
      {route.hasIndicator && (
        <span
          data-testid="sidebar-route-indicator"
          className={cn(
            "ml-auto size-1.5 rounded-full bg-primary",
            isCollapsed && "absolute top-2 right-2 ml-0",
          )}
          aria-hidden="true"
        />
      )}
    </Link>
  );

  if (!isCollapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{route.label}</TooltipContent>
    </Tooltip>
  );
}

export { SidebarNavItem };
