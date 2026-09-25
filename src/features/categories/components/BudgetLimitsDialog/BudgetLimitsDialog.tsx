"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  useUpdateCategoryBudgets,
  type CategoryBudgetPayload,
} from "@/features/categories/hooks/useCategoryMutations";
import type { CategorySummaryItem } from "@/features/categories/types";
import { amountToInput, parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";

// Strings do input; o payload final é revalidado no servidor por
// server/validators/categories.
const budgetLimitsFormSchema = z.object({
  limits: z.array(
    z.object({
      id: z.string(),
      budget: z
        .string()
        .refine(
          (value) => value.trim() === "" || parseMoney(value) > 0,
          "Informe um valor maior que zero ou deixe em branco",
        ),
    }),
  ),
});

type BudgetLimitsFormValues = z.infer<typeof budgetLimitsFormSchema>;

type BudgetLimitsDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Só categorias de despesa — orçamento não se aplica a receita.
  categories: readonly CategorySummaryItem[];
}>;

function toBudgetInput(category: CategorySummaryItem): string {
  return category.monthlyBudget === null
    ? ""
    : amountToInput(String(category.monthlyBudget));
}

function BudgetLimitsForm({
  categories,
  onDone,
}: Readonly<{
  categories: readonly CategorySummaryItem[];
  onDone: () => void;
}>) {
  const updateBudgets = useUpdateCategoryBudgets();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetLimitsFormValues>({
    resolver: zodResolver(budgetLimitsFormSchema),
    defaultValues: {
      limits: categories.map((category) => ({
        id: category.id,
        budget: toBudgetInput(category),
      })),
    },
  });

  async function onSubmit(values: BudgetLimitsFormValues) {
    // Só envia o que mudou: evita reescrever linhas intocadas.
    const changed: CategoryBudgetPayload[] = values.limits.flatMap(
      (limit, index) => {
        const category = categories[index];
        if (!category || limit.budget === toBudgetInput(category)) return [];

        return [
          {
            id: limit.id,
            monthlyBudget:
              limit.budget.trim() === "" ? null : parseMoney(limit.budget),
          },
        ];
      },
    );

    if (changed.length === 0) {
      onDone();
      return;
    }

    try {
      await updateBudgets.mutateAsync(changed);
      showToast.success({
        title:
          changed.length === 1
            ? "Limite atualizado"
            : `${changed.length} limites atualizados`,
      });
      onDone();
    } catch (error) {
      showToast.error({
        title: "Não foi possível atualizar os limites",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
      aria-busy={updateBudgets.isPending || undefined}
    >
      <ul className="grid max-h-[50dvh] gap-4 overflow-y-auto pr-1">
        {categories.map((category, index) => (
          <li key={category.id} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-8 size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: category.color }}
            />
            <Controller
              control={control}
              name={`limits.${index}.budget`}
              render={({ field }) => (
                <Input
                  label={category.name}
                  prefix="R$"
                  inputMode="decimal"
                  placeholder="Sem limite"
                  className="flex-1"
                  error={errors.limits?.[index]?.budget?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Deixe em branco para remover o limite de uma categoria.
      </p>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={updateBudgets.isPending}>
          {updateBudgets.isPending ? "Salvando…" : "Salvar limites"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function BudgetLimitsDialog({
  open,
  onOpenChange,
  categories,
}: BudgetLimitsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar limites</DialogTitle>
          <DialogDescription>
            Defina o orçamento mensal de cada categoria de despesa.
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form quando a lista muda, resetando os valores. */}
        <BudgetLimitsForm
          key={categories.map((category) => category.id).join(":")}
          categories={categories}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { BudgetLimitsDialog };
