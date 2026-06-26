"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDownIcon,
  FileTextIcon,
  type LucideIcon,
  PencilIcon,
  PencilLineIcon,
  Repeat2Icon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { z } from "zod";

import { MoneyText } from "@/components/app/MoneyText";
import { Button } from "@/components/ui/Button";
import {
  useAccounts,
  useCategories,
} from "@/features/transactions/hooks/useReferenceData";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/useUpdateTransaction";
import type { TransactionListItem } from "@/features/transactions/types";
import { resolveCategoryKey } from "@/lib/categories";
import { CategoryIcon } from "@/lib/categories/category-icons";
import { brDateToIso, formatDateInput } from "@/lib/dates/br-date";
import { amountToInput, parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";

type ManualKind = "income" | "expense";

const originMeta: Record<
  TransactionListItem["origin"],
  { label: string; icon: LucideIcon }
> = {
  manual: { label: "Manual", icon: PencilLineIcon },
  import: { label: "Extrato", icon: FileTextIcon },
  recurring: { label: "Recorrente", icon: Repeat2Icon },
  integration: { label: "Integração", icon: TagIcon },
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

const editFormSchema = z.object({
  kind: z.enum(["expense", "income"]),
  amount: z
    .string()
    .refine((value) => parseMoney(value) > 0, "Informe um valor maior que zero"),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, "Selecione uma conta"),
  date: z
    .string()
    .refine((value) => brDateToIso(value) !== null, "Data inválida (DD/MM/AAAA)"),
});

type EditFormValues = z.infer<typeof editFormSchema>;

const inputClassName =
  "h-9 w-full rounded-md border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

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

function EditField({
  label,
  required = false,
  error,
  children,
}: Readonly<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}>) {
  return (
    <label className="block">
      <span className="mb-1.5 flex gap-1 text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type TransactionDetailPanelProps = Readonly<{
  transaction: TransactionListItem;
  onClose: () => void;
  // Disparado após uma mutação bem-sucedida para o pai recarregar a lista.
  onChanged: () => void;
}>;

function TransactionDetailPanel({
  transaction,
  onClose,
  onChanged,
}: TransactionDetailPanelProps) {
  const categoriesQuery = useCategories();
  const accountsQuery = useAccounts();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  // O pai remonta este painel via `key={transaction.id}`, então o estado
  // (modo, confirmação) já nasce limpo a cada transação selecionada.
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const signedAmount = getSignedAmount(transaction);
  const categoryName = transaction.category?.name ?? "Sem categoria";
  const categoryKey = resolveCategoryKey(categoryName);
  const isTransfer = transaction.kind === "transfer";
  const isMutating = updateTransaction.isPending || deleteTransaction.isPending;

  function handleRecategorize(categoryId: string) {
    if (categoryId === transaction.category?.id) {
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
    <aside
      aria-label="Detalhe da transação"
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-card lg:top-14 lg:left-auto lg:z-10 lg:w-[380px] lg:border-l lg:border-border"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">
            {mode === "edit" ? "Editar transação" : "Detalhe da transação"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
            aria-label="Fechar detalhe"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {mode === "edit" ? (
          <EditTransactionForm
            transaction={transaction}
            categories={categoriesQuery.data ?? []}
            accounts={accountsQuery.data ?? []}
            isSaving={updateTransaction.isPending}
            onCancel={() => setMode("view")}
            onSubmit={(payload) => {
              updateTransaction.mutate(
                { id: transaction.id, payload },
                {
                  onSuccess: () => {
                    showToast.success({ title: "Transação atualizada" });
                    setMode("view");
                    onChanged();
                  },
                  onError: (error) =>
                    showToast.error({
                      title: "Não foi possível salvar",
                      description:
                        error instanceof Error ? error.message : undefined,
                    }),
                },
              );
            }}
          />
        ) : (
          <ViewContent
            transaction={transaction}
            signedAmount={signedAmount}
            categoryName={categoryName}
            categoryKey={categoryKey}
            isTransfer={isTransfer}
            isMutating={isMutating}
            categories={categoriesQuery.data ?? []}
            confirmingDelete={confirmingDelete}
            isDeleting={deleteTransaction.isPending}
            onRecategorize={handleRecategorize}
            onEdit={() => setMode("edit")}
            onStartDelete={() => setConfirmingDelete(true)}
            onCancelDelete={() => setConfirmingDelete(false)}
            onConfirmDelete={handleDelete}
          />
        )}
      </div>
    </aside>
  );
}

type ViewContentProps = Readonly<{
  transaction: TransactionListItem;
  signedAmount: number;
  categoryName: string;
  categoryKey: ReturnType<typeof resolveCategoryKey>;
  isTransfer: boolean;
  isMutating: boolean;
  categories: ReadonlyArray<{ id: string; name: string; kind: string }>;
  confirmingDelete: boolean;
  isDeleting: boolean;
  onRecategorize: (categoryId: string) => void;
  onEdit: () => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}>;

function ViewContent({
  transaction,
  signedAmount,
  categoryName,
  categoryKey,
  isTransfer,
  isMutating,
  categories,
  confirmingDelete,
  isDeleting,
  onRecategorize,
  onEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
}: ViewContentProps) {
  const [recategorizing, setRecategorizing] = useState(false);
  const origin = originMeta[transaction.origin];
  const OriginIcon = origin.icon;

  const categoryOptions = useMemo(() => {
    if (isTransfer) {
      return [];
    }

    const seen = new Set<string>();
    return categories.filter((category) => {
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
  }, [categories, isTransfer, transaction.kind]);

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 pb-5 text-center">
        <span
          className="flex size-16 items-center justify-center rounded-2xl"
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
          <CategoryIcon categoryKey={categoryKey} className="size-7" />
        </span>

        <p className="text-[1.05rem] font-medium text-foreground">
          {transaction.description ?? categoryName}
        </p>
        <MoneyText
          value={signedAmount}
          showSign
          tone={signedAmount > 0 ? "positive" : "neutral"}
          className="text-[2rem] leading-none font-bold"
        />

        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
          <OriginIcon className="size-3.5" aria-hidden="true" />
          {origin.label}
        </span>
      </div>

      <div className="border-t border-border" />

      <div className="flex flex-col">
        <DetailRow label="Data">
          {formatFullDate(transaction.occurredAt)}
        </DetailRow>

        <DetailRow label="Categoria">
          {isTransfer ? (
            categoryName
          ) : recategorizing ? (
            <select
              value={transaction.category?.id ?? ""}
              disabled={isMutating || categoryOptions.length === 0}
              onChange={(event) => {
                onRecategorize(event.target.value);
                setRecategorizing(false);
              }}
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
          ) : (
            <span className="inline-flex items-center gap-1.5">
              {transaction.category?.color ? (
                <span
                  className="size-2 rounded-[3px]"
                  style={{ backgroundColor: transaction.category.color }}
                  aria-hidden="true"
                />
              ) : null}
              {categoryName}
            </span>
          )}
        </DetailRow>

        <DetailRow label="Conta">{transaction.account.name ?? "Conta"}</DetailRow>

        {transaction.description ? (
          <DetailRow label="Descrição">{transaction.description}</DetailRow>
        ) : null}
      </div>

      {/* Placeholder para a Análise da IA (feature futura). */}
      <section className="rounded-xl border border-primary/25 bg-primary-soft/30 p-4">
        <div className="flex items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <SparklesIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">
              Análise da IA
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Em breve a IA vai explicar a categorização desta transação e
              sugerir ajustes quando achar que errou.
            </p>
          </div>
        </div>
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
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
            <Button
              variant="ghost"
              className="h-9"
              onClick={onCancelDelete}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="h-9"
              onClick={() => setRecategorizing(true)}
              disabled={isMutating || isTransfer || categoryOptions.length === 0}
            >
              <TagIcon className="size-4" aria-hidden="true" />
              Recategorizar
            </Button>
            <Button
              variant="secondary"
              className="h-9"
              onClick={onEdit}
              disabled={isMutating || isTransfer}
              title={
                isTransfer ? "Edição de transferências em breve" : undefined
              }
            >
              <PencilIcon className="size-4" aria-hidden="true" />
              Editar
            </Button>
          </div>
          <Button
            variant="ghost"
            className="h-9 text-danger hover:bg-danger-soft/50 hover:text-danger"
            onClick={onStartDelete}
            disabled={isMutating}
          >
            <Trash2Icon className="size-4" aria-hidden="true" />
            Excluir
          </Button>
        </div>
      )}
    </>
  );
}

type EditPayload = {
  accountId: string;
  categoryId: string | null;
  amount: number;
  kind: ManualKind;
  description: string;
  occurredAt: string;
};

type EditTransactionFormProps = Readonly<{
  transaction: TransactionListItem;
  categories: ReadonlyArray<{ id: string; name: string; kind: string }>;
  accounts: ReadonlyArray<{ id: string; name: string }>;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: EditPayload) => void;
}>;

function EditTransactionForm({
  transaction,
  categories,
  accounts,
  isSaving,
  onCancel,
  onSubmit,
}: EditTransactionFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    mode: "onChange",
    defaultValues: {
      kind: transaction.kind === "income" ? "income" : "expense",
      amount: amountToInput(transaction.amount),
      description: transaction.description ?? "",
      categoryId: transaction.category?.id ?? "",
      accountId: transaction.account.id,
      date: formatDateInput(new Date(transaction.occurredAt)),
    },
  });

  const [kind, categoryId] = useWatch({
    control,
    name: ["kind", "categoryId"],
  });

  const categoriesForKind = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      if (category.kind !== kind) {
        return false;
      }
      const key = normalizeCategoryName(category.name);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [categories, kind]);

  // Mantém a categoria coerente com o tipo selecionado.
  useEffect(() => {
    const stillValid = categoriesForKind.some((c) => c.id === categoryId);
    if (!stillValid) {
      setValue("categoryId", categoriesForKind[0]?.id ?? "");
    }
  }, [categoriesForKind, categoryId, setValue]);

  function submit(values: EditFormValues) {
    const occurredAt = brDateToIso(values.date);
    if (!occurredAt) {
      return;
    }

    onSubmit({
      accountId: values.accountId,
      categoryId: values.categoryId ? values.categoryId : null,
      amount: parseMoney(values.amount),
      kind: values.kind,
      description: values.description.trim(),
      occurredAt,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <div className="flex gap-2 rounded-md bg-muted p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => field.onChange(option)}
                className={
                  field.value === option
                    ? "h-9 flex-1 rounded-md bg-card text-sm font-medium text-foreground shadow-card"
                    : "h-9 flex-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {option === "expense" ? "Despesa" : "Receita"}
              </button>
            ))}
          </div>
        )}
      />

      <EditField label="Valor" required error={errors.amount?.message}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                R$
              </span>
              <input
                inputMode="decimal"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="0,00"
                className={`${inputClassName} pl-10 font-mono font-semibold`}
              />
            </div>
          )}
        />
      </EditField>

      <EditField label="Descrição" required error={errors.description?.message}>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <input
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Ex.: Almoço com a equipe"
              className={inputClassName}
            />
          )}
        />
      </EditField>

      <EditField
        label={kind === "income" ? "Categoria de receita" : "Categoria de despesa"}
      >
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <div className="relative">
              <select
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={categoriesForKind.length === 0}
                className={`${inputClassName} appearance-none pr-9`}
                aria-label="Categoria"
              >
                {categoriesForKind.length === 0 ? (
                  <option value="" disabled>
                    Sem categorias
                  </option>
                ) : null}
                {categoriesForKind.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
        />
      </EditField>

      <EditField label="Conta" required error={errors.accountId?.message}>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <div className="relative">
              <select
                value={field.value}
                onChange={field.onChange}
                disabled={accounts.length === 0}
                className={`${inputClassName} appearance-none pr-9`}
                aria-label="Conta"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
        />
      </EditField>

      <EditField label="Data" required error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <input
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="DD/MM/AAAA"
              className={`${inputClassName} font-mono`}
            />
          )}
        />
      </EditField>

      <div className="mt-1 flex gap-2">
        <Button
          type="submit"
          className="h-9 flex-1"
          disabled={!isValid || isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export { TransactionDetailPanel };
