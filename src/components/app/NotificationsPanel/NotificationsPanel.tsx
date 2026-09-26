"use client";

import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  BellIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type NotificationType = "ai" | "budget" | "debt" | "goal" | "import";

type Notification = Readonly<{
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  // Data do evento, quando existe uma. Notificações derivadas de análise não
  // têm: elas são recalculadas a cada leitura, e inventar um "há 2 horas" seria
  // mostrar um dado que não existe. Nesses casos use `caption`.
  createdAt?: Date;
  // Texto curto no lugar do tempo relativo (ex.: "análise de mai 2026").
  caption?: string;
  unread: boolean;
  // Para onde a notificação leva ao ser clicada.
  href?: string;
}>;

const NOTIFICATION_TYPES = {
  ai: {
    icon: SparklesIcon,
    className: "bg-primary-soft text-primary",
  },
  budget: {
    icon: TriangleAlertIcon,
    className: "bg-warning-soft text-warning",
  },
  debt: {
    icon: CreditCardIcon,
    className: "bg-info-soft text-info",
  },
  goal: {
    icon: TargetIcon,
    className: "bg-success-soft text-success",
  },
  import: {
    icon: CheckCircle2Icon,
    className: "bg-success-soft text-success",
  },
} satisfies Record<
  NotificationType,
  {
    icon: LucideIcon;
    className: string;
  }
>;

const MOCKED_NOTIFICATIONS: readonly Notification[] = [
  {
    id: "ai-subscriptions",
    type: "ai",
    title: "Novo insight disponível",
    description: "3 assinaturas com baixo uso somam R$ 112/mês.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: true,
  },
  {
    id: "budget-leisure",
    type: "budget",
    title: "Orçamento de Lazer estourado",
    description: "Você passou do limite de R$ 500 em maio.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unread: true,
  },
  {
    id: "card-installment",
    type: "debt",
    title: "Parcela do cartão em 3 dias",
    description: "Cartão Nubank · R$ 550,00 vence em 03/06.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unread: true,
  },
  {
    id: "reserve-goal",
    type: "goal",
    title: "Meta de reserva avançou",
    description: "Você atingiu 52% da Reserva de emergência.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    unread: false,
  },
  {
    id: "statement-imported",
    type: "import",
    title: "Extrato importado",
    description: "20 transações de maio foram adicionadas.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unread: false,
  },
];

type NotificationItemProps = Readonly<{
  notification: Notification;
  onNavigate?: () => void;
}>;

function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const type = NOTIFICATION_TYPES[notification.type];
  const Icon = type.icon;
  const timeLabel =
    notification.caption ??
    (notification.createdAt
      ? formatRelativeTime(notification.createdAt)
      : null);

  const body = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          type.className,
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-semibold text-foreground">
          {notification.title}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
          {notification.description}
        </p>
        {timeLabel && (
          <p className="mt-1 text-xs text-muted-foreground">{timeLabel}</p>
        )}
      </div>
    </>
  );

  return (
    <li className="relative border-b last:border-b-0">
      {notification.href ? (
        <Link
          href={notification.href}
          onClick={onNavigate}
          className="flex gap-4 px-6 py-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
        >
          {body}
        </Link>
      ) : (
        <div className="flex gap-4 px-6 py-4">{body}</div>
      )}

      {notification.unread && (
        <span
          className="absolute top-5 right-5 size-2 rounded-full bg-primary"
          aria-label="Não lida"
        />
      )}
    </li>
  );
}

type NotificationsPanelProps = Readonly<{
  // Sem lista explícita o painel mostra o conjunto de exemplo (Storybook/teste).
  // Em produção o layout autenticado injeta as notificações reais.
  notifications?: readonly Notification[];
}>;

function NotificationsPanel({
  notifications: initialNotifications = MOCKED_NOTIFICATIONS,
}: NotificationsPanelProps = {}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  function handleOpenChange(next: boolean) {
    setOpen(next);
  }

  function handleMarkAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <IconButton
          aria-label={
            unreadCount > 0
              ? `Notificações, ${unreadCount} novas`
              : "Notificações"
          }
          variant="secondary"
          className="relative"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-background"
              aria-hidden="true"
            />
          )}
        </IconButton>
      </PopoverTrigger>

      <PopoverContent
        className="w-[min(28rem,calc(100vw-2rem))] p-0"
        align="center"
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            Notificações
          </h2>
          <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-medium text-primary">
            {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
          </span>
          <Button
            variant="link"
            size="sm"
            className="ml-auto h-auto px-0 text-sm"
            disabled={unreadCount === 0}
            onClick={handleMarkAsRead}
          >
            Marcar lidas
          </Button>
        </div>

        <Divider />

        <ul className="max-h-[30rem] overflow-y-auto" aria-label="Notificações">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationItem, NotificationsPanel };
export type { Notification, NotificationsPanelProps, NotificationType };
