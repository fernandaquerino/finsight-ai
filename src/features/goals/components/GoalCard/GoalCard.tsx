"use client";

import {
  EllipsisIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { GoalProgressRing } from "@/features/goals/components/GoalProgressRing";
import type { GoalStatus, GoalSummaryItem } from "@/features/goals/types";
import { formatMoney } from "@/lib/money";

type GoalCardProps = Readonly<{
  goal: GoalSummaryItem;
  onEdit: (goal: GoalSummaryItem) => void;
  onDelete: (goal: GoalSummaryItem) => void;
}>;

// Rótulo e cor por status. Mesmo mapa usado no badge e no anel, para que o sinal
// visual e o texto nunca discordem.
const statusMeta: Record<
  GoalStatus,
  {
    label: string;
    badge: "success" | "warning" | "destructive" | "secondary";
    tone: string;
  }
> = {
  achieved: { label: "Concluída", badge: "success", tone: "text-success" },
  "on-track": { label: "No ritmo", badge: "success", tone: "text-success" },
  attention: { label: "Atenção", badge: "warning", tone: "text-warning" },
  behind: { label: "Atrasada", badge: "destructive", tone: "text-danger" },
  unplanned: {
    label: "Sem aporte",
    badge: "secondary",
    tone: "text-muted-foreground",
  },
};

const monthNames = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "Sem prazo";

  const [year, month] = deadline.split("-").map(Number);
  return `${monthNames[(month ?? 1) - 1] ?? ""} ${year}`;
}

function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const meta = statusMeta[goal.status];
  const percent = Math.round(goal.progress * 100);

  return (
    <Card className="flex h-full flex-col gap-3.5">
      <div className="flex items-center gap-3.5">
        <GoalProgressRing
          progress={goal.progress}
          iconKey={goal.icon}
          toneClassName={meta.tone}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
              {goal.name}
            </h3>
            <Badge variant={meta.badge} className="shrink-0">
              {meta.label}
            </Badge>
          </div>

          <p className="mt-0.5 text-lg leading-tight font-semibold">
            <MoneyText value={goal.currentAmount} tone="neutral" />
            <span className="text-[13px] font-normal text-muted-foreground">
              {" / "}
              {formatMoney(goal.targetAmount)}
            </span>
          </p>

          <div className="mt-0.5 flex justify-between gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{percent}% concluído</span>
            <span>Prazo: {formatDeadline(goal.deadline)}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={`Opções da meta ${goal.name}`}
            >
              <EllipsisIcon aria-hidden="true" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(goal)}>
              <PencilIcon aria-hidden="true" />
              Editar meta
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(goal)}
            >
              <Trash2Icon aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projeção: cálculo determinístico do servidor, não texto de LLM. */}
      <div className="mt-auto flex gap-2.5 rounded-md border border-primary/20 bg-primary-soft px-3 py-2.5">
        <SparklesIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">
          {goal.projection.message}
        </p>
      </div>
    </Card>
  );
}

export { GoalCard, statusMeta };
