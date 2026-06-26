"use client";

import { useMemo, useState } from "react";
import {
  PencilIcon,
  Repeat2Icon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useCategories } from "@/features/transactions/hooks/useReferenceData";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/useUpdateTransaction";
import type { TransactionListItem } from "@/features/transactions/types";
import { resolveCategoryKey } from "@/lib/categories";
import { CategoryIcon } from "@/lib/categories/category-icons";
import { showToast } from "@/lib/toast/toast";

type ManualKind = "income" | "expense";

const originLabel: Record<TransactionListItem["origin"], string> = {
  manual: "Manual",
  import: "Importada",
  recurring: "Recorrente",
  integration: "Integração",
};

const monthLabels = [
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

function normalizeCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function formatFullDate(value: string): string {
  const date = new Date(value);
  return `${date.getDate()} ${monthLabels[date.getMonth()]} · ${date.getFullYear()}`;
}

function getSignedAmount(transaction: TransactionListItem): number {
  const amount = Math.abs(Number(transaction.amount));
  return transaction.kind === "expense" ? -amount : amount;
}

function DetailRow({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

type TransactionDetailPanelProps = Readonly<{
  transaction: TransactionListItem | null;
  open: boolean;
  onClose: () => void;
  // Disparado após uma mutação bem-sucedida para o pai recarregar a lista.
  onChanged: () => void;
}>;

function TransactionDetailPanel({
  transaction,
  open,
  onClose,
  onChanged,
}: TransactionDetailPanelProps) {
  const categoriesQuery = useCategories();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const categoryOptions = useMemo(() => {
    if (!transaction || transaction.kind === "transfer") {
      return [];
    }

    const seen = new Set<string>();
    return (categoriesQuery.data ?? []).filter((category) => {
      if (category.kind !== (transaction.kind as ManualKind)) {
        return false;
      }
      const key = normalizeCategoryName(category.name);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [categoriesQuery.data, transaction]);

  if (!transaction) {
    return null;
  }

  const signedAmount = getSignedAmount(transaction);
  const categoryName = transaction.category?.name ?? "Sem categoria";
  const categoryKey = resolveCategoryKey(categoryName);
  const isMutating = updateTransaction.isPending || deleteTransaction.isPending;

  function handleRecategorize(categoryId: string) {
    if (!transaction || categoryId === transaction.category?.id) {
      return;
    }

    updateTransaction.mutate(
      { id: transaction.id, payload: { categoryId } },
      {
        onSuccess: () => {
          showToast.success({ title: "Categoria atualizada" });
          onChanged();
        },
        onError: (error) =>
          showToast.error({
            title: "Não foi possível recategorizar",
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    );
  }

  function handleDelete() {
    if (!transaction) {
      return;
    }

    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => {
        showToast.success({ title: "Transação excluída" });
        setConfirmingDelete(false);
        onChanged();
        onClose();
      },
      onError: (error) =>
        showToast.error({
          title: "Não foi possível excluir",
          description: error instanceof Error ? error.message : undefined,
        }),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setConfirmingDelete(false);
          onClose();
        }
      }}
    >
      <DialogContent className="top-0 right-0 left-auto h-full max-h-none w-full max-w-md translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-l p-0 sm:rounded-l-xl">
        <div className="flex flex-col gap-5 p-6">
          <DialogTitle className="text-base">Detalhe da transação</DialogTitle>

          <div className="flex flex-col items-center gap-3 border-b border-border pb-5 text-center">
            <span
              className="flex size-14 items-center justify-center rounded-xl border border-border"
              style={
                transaction.category?.color
                  ? {
                      backgroundColor: `color-mix(in srgb, ${transaction.category.color} 14%, transparent)`,
                      color: transaction.category.color,
                    }
                  : undefined
              }
              aria-hidden="true"
            >
              <CategoryIcon categoryKey={categoryKey} className="size-6" />
            </span>

            <div>
              <p className="text-base font-medium text-foreground">
                {transaction.description ?? categoryName}
              </p>
              <MoneyText
                value={signedAmount}
                showSign
                tone={signedAmount > 0 ? "positive" : "neutral"}
                className="text-2xl font-bold"
              />
            </div>

            <DialogDescription className="sr-only">
              Informações e ações da transação selecionada.
            </DialogDescription>
          </div>

          <div className="divide-y divide-border">
            <DetailRow label="Data">
              {formatFullDate(transaction.occurredAt)}
            </DetailRow>

            <DetailRow label="Categoria">
              {transaction.kind === "transfer" ? (
                categoryName
              ) : (
                <select
                  value={transaction.category?.id ?? ""}
                  disabled={isMutating || categoryOptions.length === 0}
                  onChange={(event) => handleRecategorize(event.target.value)}
                  className="h-8 rounded-md border border-border-strong bg-card px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  aria-label="Recategorizar transação"
                >
                  {!transaction.category ? (
                    <option value="" disabled>
                      Sem categoria
                    </option>
                  ) : null}
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </DetailRow>

            <DetailRow label="Conta">
              {transaction.account.name ?? "Conta"}
            </DetailRow>

            <DetailRow label="Origem">{originLabel[transaction.origin]}</DetailRow>

            {transaction.description ? (
              <DetailRow label="Descrição">{transaction.description}</DetailRow>
            ) : null}
          </div>

          {/* Placeholder para a Análise da IA (feature futura). */}
          <section className="rounded-lg border border-primary/25 bg-primary-soft/35 p-4">
            <div className="flex items-center gap-2 text-primary">
              <SparklesIcon className="size-4" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.12em] uppercase">
                Análise da IA
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Em breve a IA vai explicar a categorização e trazer insights desta
              transação.
            </p>
          </section>

          {confirmingDelete ? (
            <div className="flex flex-col gap-2 rounded-lg border border-danger/30 bg-danger-soft/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Excluir esta transação?
              </p>
              <p className="text-sm text-muted-foreground">
                Ela sai da sua lista. Esta ação não pode ser desfeita por aqui.
              </p>
              <div className="mt-1 flex gap-2">
                <Button
                  variant="destructive"
                  className="h-9 flex-1"
                  onClick={handleDelete}
                  disabled={deleteTransaction.isPending}
                >
                  {deleteTransaction.isPending ? "Excluindo..." : "Excluir"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleteTransaction.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="h-9"
                disabled
                title="Em breve"
              >
                <PencilIcon className="size-4" aria-hidden="true" />
                Editar
              </Button>
              <Button
                variant="secondary"
                className="h-9"
                disabled
                title="Em breve"
              >
                <Repeat2Icon className="size-4" aria-hidden="true" />
                Marcar recorrente
              </Button>
              <Button
                variant="destructive"
                className="col-span-2 h-9"
                onClick={() => setConfirmingDelete(true)}
                disabled={isMutating}
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
                Excluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TransactionDetailPanel };
