"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  BellIcon,
  CirclePlusIcon,
  CreditCardIcon,
  LayoutGridIcon,
  MenuIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  TagIcon,
  TargetIcon,
  UploadIcon,
} from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/app/Logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/Drawer";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  hasIndicator?: boolean;
}>;

type NavigationGroup = Readonly<{
  label: string;
  items: readonly NavigationItem[];
}>;

const navigationGroups: readonly NavigationGroup[] = [
  {
    label: "Visao geral",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutGridIcon },
      { label: "Transacoes", href: "/transactions", icon: ArrowLeftRightIcon },
      { label: "Relatorios", href: "/reports", icon: BarChart3Icon },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { label: "Chat IA", href: "/ai-chat", icon: MessageCircleIcon },
      {
        label: "Insights",
        href: "/insights",
        icon: SparklesIcon,
        hasIndicator: true,
      },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { label: "Metas", href: "/goals", icon: TargetIcon },
      { label: "Dividas", href: "/debts", icon: CreditCardIcon },
      { label: "Categorias", href: "/categories", icon: TagIcon },
    ],
  },
  {
    label: "Entradas",
    items: [
      { label: "Importar extrato", href: "/imports", icon: UploadIcon },
      {
        label: "Lancamento manual",
        href: "/transactions/new",
        icon: CirclePlusIcon,
      },
    ],
  },
];

const settingsItem = {
  label: "Configuracoes",
  href: "/settings",
  icon: SettingsIcon,
} satisfies NavigationItem;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentPageTitle(pathname: string): string {
  const items = [
    ...navigationGroups.flatMap((group) => group.items),
    settingsItem,
  ];

  return (
    items.find((item) => isActivePath(pathname, item.href))?.label ??
    "FinSight AI"
  );
}

function SidebarNavItem({
  item,
  isActive,
  isCollapsed = false,
  onNavigate,
}: {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
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
      {!isCollapsed && <span>{item.label}</span>}
      {item.hasIndicator && (
        <span
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
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarContent({
  pathname,
  isCollapsed = false,
  onNavigate,
}: {
  pathname: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          isCollapsed && "justify-center px-2",
        )}
      >
        {isCollapsed ? (
          <Logo className="h-8 w-8 text-foreground" title="FinSight AI" />
        ) : (
          <Logo className="h-8 w-auto text-foreground" />
        )}
      </div>

      <nav
        aria-label="Navegacao principal"
        className={cn("flex-1 space-y-6 px-3 py-4", isCollapsed && "px-2")}
      >
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!isCollapsed && (
              <p className="px-3 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isActive={isActivePath(pathname, item.href)}
                  isCollapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("border-t p-3", isCollapsed && "px-2")}>
        <SidebarNavItem
          item={settingsItem}
          isActive={isActivePath(pathname, settingsItem.href)}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}

function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-5">
      <IconButton
        aria-label="Alternar menu"
        variant="ghost"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </IconButton>

      <h1 className="min-w-0 flex-1 truncate text-base font-medium">{title}</h1>

      <div className="hidden w-full max-w-72 lg:block">
        <SearchInput />
      </div>

      <Button variant="soft" size="sm" className="hidden sm:inline-flex">
        <SparklesIcon />
        Perguntar a IA
      </Button>

      <div className="hidden sm:block">
        <ThemeToggle variant="icon" />
      </div>

      <IconButton aria-label="Notificacoes" variant="secondary">
        <BellIcon />
      </IconButton>

      <Avatar name="Marina Rocha" size="md" />
    </header>
  );
}

function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const title = getCurrentPageTitle(pathname);

  function handleMenuClick() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsCollapsed((current) => !current);
      return;
    }

    setIsMobileOpen(true);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <aside
        className={cn(
          "hidden shrink-0 border-r bg-card md:flex md:flex-col",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent pathname={pathname} isCollapsed={isCollapsed} />
      </aside>

      <Drawer open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DrawerContent className="inset-y-0 right-auto bottom-auto left-0 mt-0 h-dvh w-72 rounded-none border-r">
          <DrawerTitle className="sr-only">Menu principal</DrawerTitle>
          <DrawerDescription className="sr-only">
            Navegacao principal do FinSight AI.
          </DrawerDescription>
          <SidebarContent
            pathname={pathname}
            onNavigate={() => setIsMobileOpen(false)}
          />
        </DrawerContent>
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={handleMenuClick} />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export { AppShell };
