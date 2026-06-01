import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  CirclePlusIcon,
  CreditCardIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  TagIcon,
  TargetIcon,
  UploadIcon,
} from "lucide-react";

export type AppRoute = Readonly<{
  label: string;
  href: string;
  icon: LucideIcon;
  hasIndicator?: boolean;
}>;

export type AppRouteGroup = Readonly<{
  label: string;
  routes: readonly AppRoute[];
}>;

export const appRoutes = {
  dashboard: "/",
  transactions: "/transactions",
  reports: "/reports",
  aiChat: "/ai-chat",
  insights: "/insights",
  goals: "/goals",
  debts: "/debts",
  categories: "/categories",
  imports: "/imports",
  manualEntry: "/transactions/new",
  settings: "/settings",
} as const;

export const sidebarRouteGroups: readonly AppRouteGroup[] = [
  {
    label: "VISÃO GERAL",
    routes: [
      { label: "Dashboard", href: appRoutes.dashboard, icon: LayoutGridIcon },
      {
        label: "Transações",
        href: appRoutes.transactions,
        icon: ArrowLeftRightIcon,
      },
      { label: "Relatórios", href: appRoutes.reports, icon: BarChart3Icon },
    ],
  },
  {
    label: "INTELIGÊNCIA",
    routes: [
      { label: "Chat IA", href: appRoutes.aiChat, icon: MessageCircleIcon },
      {
        label: "Insights",
        href: appRoutes.insights,
        icon: SparklesIcon,
        hasIndicator: true,
      },
    ],
  },
  {
    label: "PLANEJAMENTO",
    routes: [
      { label: "Metas", href: appRoutes.goals, icon: TargetIcon },
      { label: "Dívidas", href: appRoutes.debts, icon: CreditCardIcon },
      { label: "Categorias", href: appRoutes.categories, icon: TagIcon },
    ],
  },
  {
    label: "ENTRADAS",
    routes: [
      { label: "Importar extrato", href: appRoutes.imports, icon: UploadIcon },
      {
        label: "Lançamento manual",
        href: appRoutes.manualEntry,
        icon: CirclePlusIcon,
      },
    ],
  },
];

export const settingsRoute = {
  label: "Configurações",
  href: appRoutes.settings,
  icon: SettingsIcon,
} satisfies AppRoute;

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === appRoutes.dashboard) return pathname === appRoutes.dashboard;

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getRouteTitle(pathname: string): string {
  const routes = [
    ...sidebarRouteGroups.flatMap((group) => group.routes),
    settingsRoute,
  ];

  return (
    routes.find((route) => isActiveRoute(pathname, route.href))?.label ??
    "FinSight AI"
  );
}
