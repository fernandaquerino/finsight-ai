"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
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
  CategoryRequestError,
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/hooks/useCategoryMutations";
import type {
  CategoryKind,
  CategorySummaryItem,
} from "@/features/categories/types";
import {
  categoryColorPalette,
  categoryKeys,
  categoryMap,
  type CategoryKey,
} from "@/lib/categories";
import { CategoryIcon } from "@/lib/categories/category-icons";
import { amountToInput, parseMoney } from "@/lib/money/money";
import { showToast } from "@/lib/toast/toast";
import { cn } from "@/lib/utils";

// Schema do form (strings do input). O payload final é validado de novo no
// servidor por server/validators/categories.
const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(40, "Use no máximo 40 caracteres"),
  kind: z.enum(["expense", "income"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Escolha uma cor"),
  icon: z.enum(categoryKeys as [CategoryKey, ...CategoryKey[]]),
  budget: z
    .string()
    .refine(
      (value) => value.trim() === "" || parseMoney(value) > 0,
      "Informe um valor maior que zero ou deixe em branco",
    ),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type CategoryFormDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Presente → edição; ausente → criação.
  category?: CategorySummaryItem;
  defaultKind: CategoryKind;
}>;

function getDefaultValues(
  category: CategorySummaryItem | undefined,
  defaultKind: CategoryKind,
): CategoryFormValues {
  if (category) {
    return {
      name: category.name,
      kind: category.kind,
      color: category.color.toUpperCase(),
      icon: category.icon,
      budget:
        category.monthlyBudget === null
          ? ""
          : amountToInput(String(category.monthlyBudget)),
    };
  }

  return {
    name: "",
    kind: defaultKind,
    color: categoryColorPalette[0] ?? "#94A3B8",
    icon: "outros",
    budget: "",
  };
}

const kindOptions = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
] as const;

function CategoryForm({
  category,
  defaultKind,
  onDone,
}: Readonly<{
  category?: CategorySummaryItem;
  defaultKind: CategoryKind;
  onDone: () => void;
}>) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getDefaultValues(category, defaultKind),
  });

  const selectedColor = useWatch({ control, name: "color" });

  async function onSubmit(values: CategoryFormValues) {
    const monthlyBudget =
      values.budget.trim() === "" ? null : parseMoney(values.budget);

    try {
      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          payload: {
            name: values.name,
            color: values.color,
            icon: values.icon,
            monthlyBudget,
          },
        });
        showToast.success({ title: "Categoria atualizada" });
      } else {
        await createCategory.mutateAsync({
          name: values.name,
          color: values.color,
          icon: values.icon,
          kind: values.kind,
          monthlyBudget,
        });
        showToast.success({ title: "Categoria criada" });
      }
      onDone();
    } catch (error) {
      if (
        error instanceof CategoryRequestError &&
        (error.code === "DUPLICATE_CATEGORY" ||
          error.code === "PROTECTED_CATEGORY")
      ) {
        setError("name", { message: error.message });
        return;
      }

      showToast.error({
        title: isEditing
          ? "Não foi possível atualizar a categoria"
          : "Não foi possível criar a categoria",
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
            label="Nome"
            required
            autoFocus
            maxLength={40}
            placeholder="Ex.: Academia"
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
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-xs font-medium text-foreground">
              Tipo
            </legend>
            <div className="flex gap-2 rounded-md bg-muted p-1">
              {kindOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    field.value === option.value
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground",
                    isEditing && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={field.name}
                    value={option.value}
                    checked={field.value === option.value}
                    disabled={isEditing}
                    onChange={() => field.onChange(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {isEditing ? (
              <p className="text-xs text-muted-foreground">
                O tipo não pode ser alterado depois da criação.
              </p>
            ) : null}
          </fieldset>
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-foreground">
              Cor
            </legend>
            <div className="flex flex-wrap gap-2">
              {categoryColorPalette.map((color) => {
                const checked = field.value.toUpperCase() === color;
                return (
                  <label
                    key={color}
                    className="relative flex size-8 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-background has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                    style={{ backgroundColor: color }}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={field.name}
                      value={color}
                      checked={checked}
                      onChange={() => field.onChange(color)}
                    />
                    <span className="sr-only">Cor {color}</span>
                    {checked ? (
                      <CheckIcon
                        className="size-4 text-white"
                        aria-hidden="true"
                      />
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
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
            <div className="grid grid-cols-7 gap-2">
              {categoryKeys.map((key) => {
                const checked = field.value === key;
                return (
                  <label
                    key={key}
                    title={categoryMap[key].label}
                    className={cn(
                      "flex aspect-square cursor-pointer items-center justify-center rounded-md border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      checked
                        ? "border-transparent"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                    style={
                      checked
                        ? {
                            backgroundColor: `${selectedColor}1F`,
                            color: selectedColor,
                          }
                        : undefined
                    }
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={field.name}
                      value={key}
                      checked={checked}
                      onChange={() => field.onChange(key)}
                    />
                    <span className="sr-only">{categoryMap[key].label}</span>
                    <CategoryIcon
                      categoryKey={key}
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

      <Controller
        control={control}
        name="budget"
        render={({ field }) => (
          <Input
            label="Orçamento mensal"
            prefix="R$"
            inputMode="decimal"
            placeholder="0,00"
            helperText="Opcional. Usado para acompanhar o gasto do mês."
            error={errors.budget?.message}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando…"
            : isEditing
              ? "Salvar alterações"
              : "Criar categoria"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultKind,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Alterações aparecem em todas as transações desta categoria."
              : "Organize seus lançamentos e, se quiser, defina um orçamento mensal."}
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao trocar de categoria, resetando os valores. */}
        <CategoryForm
          key={category?.id ?? "new"}
          category={category}
          defaultKind={defaultKind}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CategoryFormDialog };
