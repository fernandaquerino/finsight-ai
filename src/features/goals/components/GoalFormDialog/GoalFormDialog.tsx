"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
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
  GoalRequestError,
  useCreateGoal,
  useUpdateGoal,
} from "@/features/goals/hooks/useGoalMutations";
import type { GoalSummaryItem } from "@/features/goals/types";
import { GoalIcon, goalIconKeys, goalIconLabels } from "@/lib/goals";
import { amountToInput, parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";
import { cn } from "@/lib/utils";

// Schema do form (strings do input). O payload final é validado de novo no
// servidor por server/validators/goals — nunca só no cliente.
const goalFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(60, "Use no máximo 60 caracteres"),
    icon: z.enum(goalIconKeys as [string, ...string[]]),
    targetAmount: z
      .string()
      .refine(
        (value) => parseMoney(value) > 0,
        "Informe um valor maior que zero",
      ),
    currentAmount: z
      .string()
      .refine(
        (value) => value.trim() === "" || parseMoney(value) >= 0,
        "Informe um valor válido",
      ),
    monthlyContribution: z
      .string()
      .refine(
        (value) => value.trim() === "" || parseMoney(value) > 0,
        "Informe um valor maior que zero ou deixe em branco",
      ),
    deadline: z
      .string()
      .refine(
        (value) => value.trim() === "" || /^\d{4}-\d{2}$/.test(value),
        "Escolha um mês",
      ),
  })
  .refine(
    (values) =>
      values.currentAmount.trim() === "" ||
      parseMoney(values.currentAmount) <= parseMoney(values.targetAmount),
    {
      message: "O valor guardado não pode passar do alvo",
      path: ["currentAmount"],
    },
  );

type GoalFormValues = z.infer<typeof goalFormSchema>;

type GoalFormDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Presente → edição; ausente → criação.
  goal?: GoalSummaryItem;
}>;

// O input é um <input type="month"> (YYYY-MM); a coluna guarda uma data. O prazo
// é o último dia do mês escolhido: é o que "até dezembro" significa.
function monthToLastDay(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year ?? 1970, monthNumber ?? 1, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}`;
}

function deadlineToMonth(deadline: string | null): string {
  return deadline ? deadline.slice(0, 7) : "";
}

function getDefaultValues(goal: GoalSummaryItem | undefined): GoalFormValues {
  if (goal) {
    return {
      name: goal.name,
      icon: goal.icon,
      targetAmount: amountToInput(String(goal.targetAmount)),
      currentAmount: amountToInput(String(goal.currentAmount)),
      monthlyContribution:
        goal.monthlyContribution === null
          ? ""
          : amountToInput(String(goal.monthlyContribution)),
      deadline: deadlineToMonth(goal.deadline),
    };
  }

  return {
    name: "",
    icon: "piggy-bank",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    deadline: "",
  };
}

// Pré-visualização do que a projeção vai dizer, calculada localmente enquanto o
// usuário digita. O número definitivo vem do servidor depois de salvar.
function projectionPreview(values: GoalFormValues): string {
  const target = parseMoney(values.targetAmount);
  const current =
    values.currentAmount.trim() === "" ? 0 : parseMoney(values.currentAmount);
  const contribution =
    values.monthlyContribution.trim() === ""
      ? 0
      : parseMoney(values.monthlyContribution);

  if (target <= 0) {
    return "Informe o valor-alvo e um aporte mensal para eu projetar quando você chega lá.";
  }

  const remaining = Math.max(0, target - current);
  if (remaining === 0) {
    return "Com o valor já guardado, esta meta nasce concluída.";
  }

  if (contribution <= 0) {
    return "Informe um aporte mensal e eu estimo em quantos meses a meta é atingida.";
  }

  const months = Math.ceil(remaining / contribution);
  return `No ritmo de ${values.monthlyContribution} por mês, a estimativa é atingir a meta em ${months === 1 ? "1 mês" : `${months} meses`}.`;
}

function GoalForm({
  goal,
  onDone,
}: Readonly<{ goal?: GoalSummaryItem; onDone: () => void }>) {
  const isEditing = Boolean(goal);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const isPending = createGoal.isPending || updateGoal.isPending;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: getDefaultValues(goal),
  });

  const watched = useWatch({ control });
  const preview = projectionPreview({
    ...getDefaultValues(goal),
    ...watched,
  } as GoalFormValues);

  async function onSubmit(values: GoalFormValues) {
    const payload = {
      name: values.name,
      icon: values.icon as GoalSummaryItem["icon"],
      targetAmount: parseMoney(values.targetAmount),
      currentAmount:
        values.currentAmount.trim() === ""
          ? 0
          : parseMoney(values.currentAmount),
      monthlyContribution:
        values.monthlyContribution.trim() === ""
          ? null
          : parseMoney(values.monthlyContribution),
      deadline:
        values.deadline.trim() === "" ? null : monthToLastDay(values.deadline),
    };

    try {
      if (goal) {
        await updateGoal.mutateAsync({ id: goal.id, payload });
        showToast.success({ title: "Meta atualizada" });
      } else {
        await createGoal.mutateAsync(payload);
        showToast.success({ title: "Meta criada", description: payload.name });
      }
      onDone();
    } catch (error) {
      showToast.error({
        title: isEditing
          ? "Não foi possível atualizar a meta"
          : "Não foi possível criar a meta",
        description:
          error instanceof GoalRequestError || error instanceof Error
            ? error.message
            : undefined,
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
            label="Nome da meta"
            required
            autoFocus
            maxLength={60}
            placeholder="Ex.: Reserva de emergência"
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
        name="icon"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-foreground">
              Ícone
            </legend>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
              {goalIconKeys.map((key) => {
                const checked = field.value === key;
                return (
                  <label
                    key={key}
                    title={goalIconLabels[key]}
                    className={cn(
                      "flex aspect-square cursor-pointer items-center justify-center rounded-md border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      checked
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={field.name}
                      value={key}
                      checked={checked}
                      onChange={() => field.onChange(key)}
                    />
                    <span className="sr-only">{goalIconLabels[key]}</span>
                    <GoalIcon
                      iconKey={key}
                      className="size-4"
                      aria-hidden="true"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <Input
              label="Valor-alvo"
              required
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              error={errors.targetAmount?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="currentAmount"
          render={({ field }) => (
            <Input
              label="Já guardado"
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              error={errors.currentAmount?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="monthlyContribution"
          render={({ field }) => (
            <Input
              label="Aporte mensal"
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              helperText="Opcional. Usado para projetar o prazo."
              error={errors.monthlyContribution?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <Input
              label="Prazo"
              type="month"
              helperText="Opcional. Mês em que você quer atingir a meta."
              error={errors.deadline?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div
        className="flex gap-2.5 rounded-md border border-primary/20 bg-primary-soft px-3 py-2.5"
        aria-live="polite"
      >
        <SparklesIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-foreground">{preview}</p>
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
              : "Criar meta"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function GoalFormDialog({ open, onOpenChange, goal }: GoalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>
            {goal
              ? "Atualize valores, aporte ou prazo — a projeção é recalculada."
              : "Defina um objetivo e eu acompanho o progresso a cada mês."}
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao trocar de meta, resetando os valores. */}
        <GoalForm
          key={goal?.id ?? "new"}
          goal={goal}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { GoalFormDialog };
