"use client";

import { EllipsisIcon, PencilIcon, Trash2Icon, ZapIcon } from "lucide-react";

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
import { debtKindLabels, type DebtSummaryItem } from "@/features/debts/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type DebtCardProps = Readonly<{
  debt: DebtSummaryItem;
  onEdit: (debt: DebtSummaryItem) => void;
  onDelete: (debt: DebtSummaryItem) => void;
}>;

function formatRate(rate: number): string {
  return `${rate.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.m.`;
}

function StatusBadge({ debt }: Readonly<{ debt: DebtSummaryItem }>) {
  if (debt.status === "settled") {
    return <Badge variant="secondary">Quitada</Badge>;
  }

  if (debt.status === "attention") {
    return (
      <Badge
        variant="warning"
        title="A parcela não cobre os juros do mês — o saldo cresce."
      >
        Atenção
      </Badge>
    );
  }

  return <Badge variant="success">Em dia</Badge>;
}

function DebtCard({ debt, onEdit, onDelete }: DebtCardProps) {
  const percentPaid = Math.round(debt.paidRatio * 100);

  return (
    <Card
      className={cn(
        "flex flex-col gap-3",
        debt.isFocus && "border-primary/40 bg-primary-soft/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {debt.isFocus ? (
          <Badge variant="default" className="gap-1">
            <ZapIcon className="size-3" aria-hidden="true" />
            Foco agora
          </Badge>
        ) : null}

        <div className="min-w-[180px] flex-1">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
              {debt.name}
            </h3>
            <StatusBadge debt={debt} />
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {debtKindLabels[debt.kind]} ·{" "}
            <span className="tabular-nums">
              {formatRate(debt.interestRate)}
            </span>
            {debt.monthlyPayment !== null ? (
              <>
                {" · parcela de "}
                <span className="tabular-nums">
                  {formatMoney(debt.monthlyPayment)}
                </span>
              </>
            ) : (
              " · sem parcela definida"
            )}
            {debt.dueDay !== null ? ` · vence dia ${debt.dueDay}` : ""}
          </p>
        </div>

        <div className="min-w-[200px] flex-1">
          <div className="mb-1.5 flex justify-between gap-2 text-xs">
            <span className="text-muted-foreground tabular-nums">
              Pago {percentPaid}%
            </span>
            <span className="font-medium">
              Restam <MoneyText value={debt.remainingAmount} tone="neutral" />
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`Progresso do pagamento de ${debt.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentPaid}
            aria-valuetext={`${percentPaid}% pago, restam ${formatMoney(debt.remainingAmount)}`}
            className="h-[7px] w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-[inherit] transition-[width] duration-500 ease-out",
                debt.isFocus ? "bg-primary" : "bg-success",
              )}
              style={{ width: `${debt.paidRatio * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Juros no próximo mês:{" "}
            <span className="tabular-nums">
              {formatMoney(debt.monthlyInterest)}
            </span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={`Opções da dívida ${debt.name}`}
            >
              <EllipsisIcon aria-hidden="true" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(debt)}>
              <PencilIcon aria-hidden="true" />
              Editar dívida
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(debt)}
            >
              <Trash2Icon aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export { DebtCard };
