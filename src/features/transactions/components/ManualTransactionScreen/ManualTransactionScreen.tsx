"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  LightbulbIcon,
  ReceiptTextIcon,
} from "lucide-react";
import { z } from "zod";

import { MoneyText } from "@/components/app/MoneyText";
import { Button } from "@/components/ui/Button";
import {
  useAccounts,
  useCategories,
} from "@/features/transactions/hooks/useReferenceData";
import { useCreateTransaction } from "@/features/transactions/hooks/useCreateTransaction";
import { resolveCategoryKey } from "@/lib/categories";
import { CategoryIcon } from "@/lib/categories/category-icons";
import { parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";
import { cn } from "@/lib/utils";

type ManualKind = "expense" | "income";

type SelectOption = Readonly<{ value: string; label: string }>;

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Converte DD/MM/AAAA -> YYYY-MM-DD (formato esperado pela API). Retorna null
// se a data não for válida (ex.: 31/02).
function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : null;
}

const manualFormSchema = z.object({
  kind: z.enum(["expense", "income"]),
  amount: z
    .string()
    .refine(
      (value) => parseMoney(value) > 0,
      "Informe um valor maior que zero",
    ),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, "Selecione uma conta"),
  date: z
    .string()
    .refine(
      (value) => brDateToIso(value) !== null,
      "Data inválida (DD/MM/AAAA)",
    ),
});

type ManualFormValues = z.infer<typeof manualFormSchema>;

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function Field({
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

function SelectLike({
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}>) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-[38px] w-full appearance-none rounded-md border border-border-strong bg-card px-3 pr-9 text-sm text-foreground transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

function KindToggle({
  kind,
  onChange,
}: Readonly<{
  kind: ManualKind;
  onChange: (kind: ManualKind) => void;
}>) {
  return (
    <div className="mb-[18px] flex gap-2 rounded-md bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          kind === "expense"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        Despesa
      </button>

      <button
        type="button"
        onClick={() => onChange("income")}
        className={cn(
          "inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          kind === "income"
            ? "bg-card text-success shadow-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowDownLeftIcon className="size-4" aria-hidden="true" />
        Receita
      </button>
    </div>
  );
}

const helperText =
  "Conforme você digita a descrição, eu sugiro a categoria mais provável com base nos seus lançamentos anteriores. Você sempre tem a palavra final.";

function ManualTransactionScreen() {
  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const createTransaction = useCreateTransaction();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<ManualFormValues>({
    resolver: zodResolver(manualFormSchema),
    mode: "onChange",
    defaultValues: {
      kind: "expense",
      amount: "",
      description: "",
      categoryId: "",
      accountId: "",
      date: formatDateInput(new Date()),
    },
  });

  const [kind, amount, description, categoryId, accountId, date] = useWatch({
    control,
    name: ["kind", "amount", "description", "categoryId", "accountId", "date"],
  });

  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const categoriesForKind = useMemo(() => {
    const seen = new Set<string>();

    return (categoriesQuery.data ?? []).filter((category) => {
      if (category.kind !== kind) {
        return false;
      }

      const key = `${category.kind}:${normalizeCategoryName(category.name)}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [categoriesQuery.data, kind]);

  // Seleciona a primeira conta quando as contas carregam e nenhuma está escolhida.
  useEffect(() => {
    const firstAccount = accounts[0];
    if (!accountId && firstAccount) {
      setValue("accountId", firstAccount.id, { shouldValidate: true });
    }
  }, [accounts, accountId, setValue]);

  // Mantém uma categoria válida para o tipo atual. Se a selecionada não
  // pertence ao tipo, cai para a primeira disponível (ou vazio).
  useEffect(() => {
    const stillValid = categoriesForKind.some((c) => c.id === categoryId);
    if (!stillValid) {
      setValue("categoryId", categoriesForKind[0]?.id ?? "");
    }
  }, [categoriesForKind, categoryId, setValue]);

  const accountOptions = useMemo<SelectOption[]>(
    () =>
      accounts.map((account) => ({ value: account.id, label: account.name })),
    [accounts],
  );
  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      categoriesForKind.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesForKind],
  );

  const selectedCategory = useMemo(
    () => categoriesForKind.find((c) => c.id === categoryId) ?? null,
    [categoriesForKind, categoryId],
  );
  const selectedCategoryKey = selectedCategory
    ? resolveCategoryKey(selectedCategory.name)
    : null;

  const parsedAmount = parseMoney(amount);
  const signedAmount =
    kind === "expense" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
  const previewDescription = description.trim() || "Descrição da trans...";

  const hasAccounts = accounts.length > 0;
  const isSubmitting = createTransaction.isPending;

  function onSubmit(values: ManualFormValues) {
    const occurredAt = brDateToIso(values.date);
    if (!occurredAt) {
      return;
    }

    createTransaction.mutate(
      {
        accountId: values.accountId,
        categoryId: values.categoryId ? values.categoryId : null,
        amount: parseMoney(values.amount),
        kind: values.kind,
        description: values.description.trim(),
        occurredAt,
      },
      {
        onSuccess: () => {
          showToast.success({ title: "Transação salva" });
          reset({
            kind: values.kind,
            amount: "",
            description: "",
            categoryId: values.categoryId,
            accountId: values.accountId,
            date: formatDateInput(new Date()),
          });
        },
        onError: (error) => {
          showToast.error({
            title: "Não foi possível salvar",
            description:
              error instanceof Error ? error.message : "Tente novamente.",
          });
        },
      },
    );
  }

  function handleClear() {
    reset({
      kind,
      amount: "",
      description: "",
      categoryId: categoriesForKind[0]?.id ?? "",
      accountId: accounts[0]?.id ?? "",
      date: formatDateInput(new Date()),
    });
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] p-5 sm:p-6">
      <div className="mx-auto grid max-w-[760px] gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-[22px] shadow-card">
          <h1 className="mb-[18px] text-base font-medium text-foreground">
            Nova transação
          </h1>

          {!accountsQuery.isLoading && !hasAccounts ? (
            <p className="mb-4 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
              Você ainda não tem contas cadastradas. Crie uma conta no
              onboarding para lançar transações.
            </p>
          ) : null}

          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <KindToggle kind={field.value} onChange={field.onChange} />
            )}
          />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Field label="Valor" required error={errors.amount?.message}>
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
                      className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 pl-10 font-mono text-base font-semibold text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              />
            </Field>

            <Field
              label="Descrição"
              required
              error={errors.description?.message}
            >
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <input
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Ex.: Almoço com a equipe"
                    className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                )}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={
                  kind === "income"
                    ? "Categoria de receita"
                    : "Categoria de despesa"
                }
              >
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <SelectLike
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={categoryOptions}
                      disabled={categoryOptions.length === 0}
                      placeholder={
                        categoryOptions.length === 0
                          ? "Sem categorias"
                          : undefined
                      }
                    />
                  )}
                />
              </Field>

              <Field label="Conta" required error={errors.accountId?.message}>
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field }) => (
                    <SelectLike
                      value={field.value}
                      onChange={field.onChange}
                      options={accountOptions}
                      disabled={!hasAccounts}
                      placeholder={!hasAccounts ? "Sem contas" : undefined}
                    />
                  )}
                />
              </Field>
            </div>

            <Field label="Data" required error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <input
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="DD/MM/AAAA"
                    className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 font-mono text-sm text-foreground transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                )}
              />
            </Field>

            <div className="mt-1 flex gap-2.5">
              <Button
                type="submit"
                disabled={!isValid || !hasAccounts || isSubmitting}
                className="h-9 flex-1"
              >
                <CheckIcon className="size-4" aria-hidden="true" />
                {isSubmitting ? "Salvando..." : "Salvar transação"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-9"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Limpar
              </Button>
            </div>
          </form>
        </section>

        <aside className="flex flex-col gap-3.5">
          <section className="rounded-lg border border-border bg-card p-4 shadow-card">
            <p className="mb-2.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Pré-visualização
            </p>

            <div className="flex items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border"
                style={
                  selectedCategory
                    ? { backgroundColor: `${selectedCategory.color}1a` }
                    : undefined
                }
                aria-hidden="true"
              >
                {selectedCategoryKey ? (
                  <CategoryIcon
                    categoryKey={selectedCategoryKey}
                    className="size-[18px]"
                    style={{ color: selectedCategory?.color }}
                  />
                ) : (
                  <ReceiptTextIcon className="size-[18px] text-muted-foreground" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {previewDescription}
                </p>
                <p className="text-xs text-muted-foreground">{date} · Manual</p>
              </div>

              <MoneyText
                value={signedAmount}
                showSign
                tone={signedAmount > 0 ? "positive" : "neutral"}
                className="text-sm font-semibold"
              />
            </div>
          </section>

          <section className="rounded-lg border border-primary/25 bg-primary-soft/45 p-4 text-muted-foreground shadow-card">
            <div className="flex gap-3">
              <LightbulbIcon
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />

              <p className="text-sm leading-relaxed">{helperText}</p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

export { ManualTransactionScreen, parseMoney };
