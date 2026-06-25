import type { ElementType, ReactNode } from "react";
import {
  BarChart3Icon,
  BellIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  ReceiptTextIcon,
} from "lucide-react";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EmptyStateVariant =
  | "generic"
  | "dashboard"
  | "transactions"
  | "chart"
  | "notifications"
  | "insights";

type EmptyStateAction = Readonly<{
  label: string;
  onClick?: () => void;
  href?: string;
}>;

type EmptyStateProps = Readonly<{
  title?: string;
  description?: string;
  icon?: ElementType;
  variant?: EmptyStateVariant;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  actionSlot?: ReactNode;
  className?: string;
}>;

const emptyStatePresets = {
  generic: {
    icon: InboxIcon,
    title: "Nada para mostrar por enquanto",
    description: "Quando houver informações disponíveis, elas aparecem aqui.",
  },
  dashboard: {
    icon: LayoutDashboardIcon,
    title: "Seu dashboard ainda está vazio",
    description:
      "Adicione transações ou importe um extrato para começar a acompanhar sua vida financeira.",
  },
  transactions: {
    icon: ReceiptTextIcon,
    title: "Nenhuma transação encontrada",
    description:
      "Ajuste os filtros ou adicione uma nova transação para preencher esta lista.",
  },
  chart: {
    icon: BarChart3Icon,
    title: "Sem dados suficientes para o gráfico",
    description:
      "Assim que houver movimentações no período, o gráfico será atualizado.",
  },
  notifications: {
    icon: BellIcon,
    title: "Nenhuma notificação",
    description: "Avisos importantes e atualizações aparecerão aqui.",
  },
  insights: {
    icon: LightbulbIcon,
    title: "Nenhum insight disponível ainda",
    description:
      "A IA precisa de mais dados financeiros para encontrar oportunidades úteis.",
  },
} as const satisfies Record<
  EmptyStateVariant,
  {
    icon: ElementType;
    title: string;
    description: string;
  }
>;

function EmptyState({
  title,
  description,
  icon,
  variant = "generic",
  primaryAction,
  secondaryAction,
  actionSlot,
  className,
}: EmptyStateProps) {
  const preset = emptyStatePresets[variant];
  const Icon = icon ?? preset.icon;

  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <div
        className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary"
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">
        {title ?? preset.title}
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description ?? preset.description}
      </p>
      {(primaryAction || secondaryAction || actionSlot) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {primaryAction && <EmptyStateButton action={primaryAction} />}
          {secondaryAction && (
            <EmptyStateButton action={secondaryAction} variant="secondary" />
          )}
          {actionSlot}
        </div>
      )}
    </section>
  );
}

function EmptyStateButton({
  action,
  variant = "default",
}: {
  action: EmptyStateAction;
  variant?: "default" | "secondary";
}) {
  // Para navegação interna usamos next/link diretamente com as classes do
  // botão, em vez de <Button asChild><a> + Radix Slot. O Slot mesclava props
  // de botão (disabled, aria-busy, onClick…) no <a>, o que disparava hydration
  // mismatch no anchor com Next 16. O link puro renderiza igual no server/client.
  if (action.href) {
    return (
      <Link
        href={action.href}
        className={cn(buttonVariants({ variant, size: "sm" }))}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <Button size="sm" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export { EmptyState, emptyStatePresets };
export type { EmptyStateAction, EmptyStateProps, EmptyStateVariant };
