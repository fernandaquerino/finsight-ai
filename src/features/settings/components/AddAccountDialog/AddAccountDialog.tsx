"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, LockIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useCreateAccount } from "@/features/settings/hooks/useSettingsMutations";
import {
  accountTypeLabels,
  accountTypes,
  type AccountType,
} from "@/features/settings/types";
import { parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";
import { cn } from "@/lib/utils";

// Atalhos de preenchimento, não integração: escolher um banco só preenche nome e
// tipo. Conexão automática com instituição é `Future` (Open Finance/Plaid).
const POPULAR_BANKS = [
  { id: "nubank", label: "Nubank", type: "checking", color: "#820AD1" },
  { id: "itau", label: "Itaú", type: "checking", color: "#EC7000" },
  { id: "inter", label: "Inter", type: "checking", color: "#FF7A00" },
  { id: "bradesco", label: "Bradesco", type: "checking", color: "#CC092F" },
  { id: "c6", label: "C6 Bank", type: "checking", color: "#242424" },
  { id: "carteira", label: "Carteira", type: "other", color: "#888780" },
] as const satisfies readonly {
  id: string;
  label: string;
  type: AccountType;
  color: string;
}[];

const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da conta é obrigatório")
    .max(60, "Use no máximo 60 caracteres"),
  type: z.enum(accountTypes),
  initialBalance: z
    .string()
    .refine(
      (value) => value.trim() === "" || Number.isFinite(parseMoney(value)),
      "Informe um valor válido",
    ),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

type AddAccountDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

function AddAccountForm({ onDone }: Readonly<{ onDone: () => void }>) {
  const createAccount = useCreateAccount();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name: "", type: "checking", initialBalance: "" },
  });

  // useWatch (e não watch()): watch() devolve uma função que o React Compiler
  // não consegue memoizar com segurança.
  const currentName = useWatch({ control, name: "name" });

  function pickBank(bank: (typeof POPULAR_BANKS)[number]) {
    setValue("name", bank.label, { shouldValidate: true });
    setValue("type", bank.type);
  }

  async function onSubmit(values: AccountFormValues) {
    try {
      await createAccount.mutateAsync({
        name: values.name,
        type: values.type,
        institution: null,
        initialBalance:
          values.initialBalance.trim() === ""
            ? null
            : parseMoney(values.initialBalance),
      });
      showToast.success({
        title: "Conta adicionada",
        description: values.name,
      });
      onDone();
    } catch (error) {
      showToast.error({
        title: "Não foi possível adicionar a conta",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      aria-busy={createAccount.isPending || undefined}
    >
      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Bancos populares
        </legend>
        <div className="flex flex-wrap gap-2">
          {POPULAR_BANKS.map((bank) => {
            const isSelected = currentName === bank.label;
            return (
              <button
                key={bank.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => pickBank(bank)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                  isSelected
                    ? "border-primary/40 bg-primary-soft text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-sm"
                  style={{ background: bank.color }}
                />
                {bank.label}
                {isSelected ? (
                  <CheckIcon aria-hidden="true" className="size-3.5" />
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          ou preencha manualmente
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Nome da conta"
              required
              maxLength={60}
              placeholder="Ex.: Conta principal"
              error={errors.name?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="grid gap-2">
              <label
                htmlFor="account-type"
                className="text-xs font-medium text-foreground"
              >
                Tipo
              </label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="account-type">
                  <SelectValue placeholder="Escolha o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {accountTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name="initialBalance"
        render={({ field }) => (
          <Input
            label="Saldo inicial"
            prefix="R$"
            inputMode="decimal"
            placeholder="0,00"
            helperText="Opcional. Você pode ajustar depois ao importar um extrato."
            error={errors.initialBalance?.message}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <div className="flex gap-2.5 rounded-md border border-primary/20 bg-primary-soft px-3 py-2.5">
        <LockIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">
          Contas manuais não pedem dados de acesso ao seu banco. Você lança as
          transações e, quando quiser, importa um extrato para preencher o
          histórico.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createAccount.isPending}>
          {createAccount.isPending ? "Adicionando…" : "Adicionar conta"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar conta</DialogTitle>
          <DialogDescription>
            Cadastre uma conta manualmente — importar extrato é opcional.
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao reabrir, descartando o rascunho anterior. */}
        <AddAccountForm
          key={open ? "open" : "closed"}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { AddAccountDialog };
