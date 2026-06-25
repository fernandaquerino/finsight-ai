"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  LightbulbIcon,
  UtensilsIcon,
} from "lucide-react";

import { MoneyText } from "@/components/app/MoneyText";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TransactionKind } from "@/features/transactions/types";

const categories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Assinaturas",
  "Saúde",
  "Lazer",
  "Outros",
] as const;

const accounts = [
  "Nubank · Conta",
  "Itaú · Corrente",
  "Inter · Conta",
  "Carteira",
] as const;

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function parseMoney(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function Field({
  label,
  required = false,
  children,
}: Readonly<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <label className="block">
      <span className="mb-1.5 flex gap-1 text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function SelectLike({
  value,
  onChange,
  options,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[38px] w-full appearance-none rounded-md border border-border-strong bg-card px-3 pr-9 text-sm text-foreground transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
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
  kind: Exclude<TransactionKind, "transfer">;
  onChange: (kind: Exclude<TransactionKind, "transfer">) => void;
}>) {
  return (
    <div className="mb-[18px] flex gap-2 rounded-md bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
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
          "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          kind === "income"
            ? "bg-card text-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowDownLeftIcon className="size-4" aria-hidden="true" />
        Receita
      </button>
    </div>
  );
}

function ManualTransactionScreen() {
  const [kind, setKind] =
    useState<Exclude<TransactionKind, "transfer">>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Alimentação");
  const [account, setAccount] =
    useState<(typeof accounts)[number]>("Nubank · Conta");
  const [date, setDate] = useState(() => formatDateInput(new Date()));
  const parsedAmount = parseMoney(amount);
  const signedAmount =
    kind === "expense" ? -Math.abs(parsedAmount) : parsedAmount;
  const previewDescription = description.trim() || "Descrição da trans...";
  const canSubmit = parsedAmount > 0 && description.trim().length > 0;

  const helperText = useMemo(
    () =>
      "Conforme você digita a descrição, eu sugiro a categoria mais provável com base nos seus lançamentos anteriores. Você sempre tem a palavra final.",
    [],
  );

  return (
    <main className="mx-auto w-full max-w-[1240px] p-5 sm:p-6">
      <div className="mx-auto grid max-w-[760px] gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-[22px] shadow-card">
          <h1 className="mb-[18px] text-base font-medium text-foreground">
            Nova transação
          </h1>

          <KindToggle kind={kind} onChange={setKind} />

          <form className="flex flex-col gap-4">
            <Field label="Valor" required>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                  R$
                </span>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 pl-10 font-mono text-base font-semibold text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </Field>

            <Field label="Descrição" required>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex.: Almoço com a equipe"
                className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoria">
                <SelectLike
                  value={category}
                  onChange={(value) =>
                    setCategory(value as (typeof categories)[number])
                  }
                  options={categories}
                />
              </Field>
              <Field label="Conta">
                <SelectLike
                  value={account}
                  onChange={(value) =>
                    setAccount(value as (typeof accounts)[number])
                  }
                  options={accounts}
                />
              </Field>
            </div>

            <Field label="Data">
              <input
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-[38px] w-full rounded-md border border-border-strong bg-card px-3 font-mono text-sm text-foreground transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Field>

            <div className="mt-1 flex gap-2.5">
              <Button
                type="button"
                disabled={!canSubmit}
                className="h-9 flex-1"
              >
                <CheckIcon className="size-4" aria-hidden="true" />
                Salvar transação
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9"
                onClick={() => {
                  setAmount("");
                  setDescription("");
                  setCategory("Alimentação");
                  setAccount("Nubank · Conta");
                  setDate(formatDateInput(new Date()));
                }}
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
                className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success"
                aria-hidden="true"
              >
                <UtensilsIcon className="size-[18px]" />
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
