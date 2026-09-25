"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon } from "lucide-react";
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
import {
  DebtRequestError,
  useCreateDebt,
  useUpdateDebt,
} from "@/features/debts/hooks/useDebtMutations";
import {
  debtKindOptions,
  type DebtKind,
  type DebtSummaryItem,
} from "@/features/debts/types";
import { amountToInput, parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";

// Schema do form (strings do input). O payload final é validado de novo no
// servidor por server/validators/debts — nunca só no cliente.
const debtFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Descrição é obrigatória")
      .max(60, "Use no máximo 60 caracteres"),
    kind: z.enum([
      "credit_card",
      "personal_loan",
      "financing",
      "consumer_credit",
      "other",
    ]),
    totalAmount: z
      .string()
      .refine(
        (value) => parseMoney(value) > 0,
        "Informe um valor maior que zero",
      ),
    remainingAmount: z
      .string()
      .refine((value) => parseMoney(value) >= 0, "Informe um valor válido"),
    monthlyPayment: z
      .string()
      .refine(
        (value) => value.trim() === "" || parseMoney(value) > 0,
        "Informe um valor maior que zero ou deixe em branco",
      ),
    interestRate: z.string().refine((value) => {
      if (value.trim() === "") return true;
      const rate = parseMoney(value);
      return rate >= 0 && rate <= 100;
    }, "Informe a taxa mensal entre 0 e 100"),
    dueDay: z.string().refine((value) => {
      if (value.trim() === "") return true;
      const day = Number(value);
      return Number.isInteger(day) && day >= 1 && day <= 31;
    }, "Informe um dia entre 1 e 31"),
  })
  .refine(
    (values) =>
      parseMoney(values.remainingAmount) <= parseMoney(values.totalAmount),
    {
      message: "O saldo devedor não pode passar do valor contratado",
      path: ["remainingAmount"],
    },
  );

type DebtFormValues = z.infer<typeof debtFormSchema>;

type DebtFormDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Presente → edição; ausente → criação.
  debt?: DebtSummaryItem;
}>;

function getDefaultValues(debt: DebtSummaryItem | undefined): DebtFormValues {
  if (debt) {
    return {
      name: debt.name,
      kind: debt.kind,
      totalAmount: amountToInput(String(debt.totalAmount)),
      remainingAmount: amountToInput(String(debt.remainingAmount)),
      monthlyPayment:
        debt.monthlyPayment === null
          ? ""
          : amountToInput(String(debt.monthlyPayment)),
      interestRate: String(debt.interestRate).replace(".", ","),
      dueDay: debt.dueDay === null ? "" : String(debt.dueDay),
    };
  }

  return {
    name: "",
    kind: "credit_card",
    totalAmount: "",
    remainingAmount: "",
    monthlyPayment: "",
    interestRate: "",
    dueDay: "",
  };
}

function DebtForm({
  debt,
  onDone,
}: Readonly<{ debt?: DebtSummaryItem; onDone: () => void }>) {
  const isEditing = Boolean(debt);
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const isPending = createDebt.isPending || updateDebt.isPending;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: getDefaultValues(debt),
  });

  async function onSubmit(values: DebtFormValues) {
    const payload = {
      name: values.name,
      kind: values.kind as DebtKind,
      totalAmount: parseMoney(values.totalAmount),
      remainingAmount: parseMoney(values.remainingAmount),
      monthlyPayment:
        values.monthlyPayment.trim() === ""
          ? null
          : parseMoney(values.monthlyPayment),
      interestRate:
        values.interestRate.trim() === "" ? 0 : parseMoney(values.interestRate),
      dueDay: values.dueDay.trim() === "" ? null : Number(values.dueDay),
    };

    try {
      if (debt) {
        await updateDebt.mutateAsync({ id: debt.id, payload });
        showToast.success({ title: "Dívida atualizada" });
      } else {
        await createDebt.mutateAsync(payload);
        showToast.success({
          title: "Dívida adicionada",
          description: "Reordenei a estratégia de quitação.",
        });
      }
      onDone();
    } catch (error) {
      if (
        error instanceof DebtRequestError &&
        error.code === "INVALID_BALANCE"
      ) {
        setError("remainingAmount", { message: error.message });
        return;
      }

      showToast.error({
        title: isEditing
          ? "Não foi possível atualizar a dívida"
          : "Não foi possível criar a dívida",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      aria-busy={isPending || undefined}
    >
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Descrição"
            required
            autoFocus
            maxLength={60}
            placeholder="Ex.: Cartão Nubank"
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
        name="kind"
        render={({ field }) => (
          <div className="grid gap-2">
            <label
              htmlFor="debt-kind"
              className="text-xs font-medium text-foreground"
            >
              Tipo
            </label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="debt-kind">
                <SelectValue placeholder="Escolha o tipo" />
              </SelectTrigger>
              <SelectContent>
                {debtKindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="totalAmount"
          render={({ field }) => (
            <Input
              label="Valor contratado"
              required
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              helperText="Base do progresso “quanto já foi pago”."
              error={errors.totalAmount?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="remainingAmount"
          render={({ field }) => (
            <Input
              label="Saldo devedor"
              required
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              error={errors.remainingAmount?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          control={control}
          name="monthlyPayment"
          render={({ field }) => (
            <Input
              label="Parcela mensal"
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              error={errors.monthlyPayment?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="interestRate"
          render={({ field }) => (
            <Input
              label="Juros (% a.m.)"
              inputMode="decimal"
              placeholder="Ex.: 13,9"
              error={errors.interestRate?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="dueDay"
          render={({ field }) => (
            <Input
              label="Dia do vencimento"
              inputMode="numeric"
              placeholder="Ex.: 10"
              error={errors.dueDay?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="flex gap-2.5 rounded-md border border-primary/20 bg-primary-soft px-3 py-2.5">
        <SparklesIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">
          A taxa de juros é o que define a ordem da estratégia avalanche. Sem
          ela eu não consigo estimar quanto cada dívida custa por mês.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando…"
            : isEditing
              ? "Salvar alterações"
              : "Adicionar dívida"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DebtFormDialog({ open, onOpenChange, debt }: DebtFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{debt ? "Editar dívida" : "Nova dívida"}</DialogTitle>
          <DialogDescription>
            {debt
              ? "Atualizar o saldo ou a taxa recalcula a estratégia de quitação."
              : "Acompanhe e quite com a estratégia certa."}
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao trocar de dívida, resetando os valores. */}
        <DebtForm
          key={debt?.id ?? "new"}
          debt={debt}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { DebtFormDialog };
