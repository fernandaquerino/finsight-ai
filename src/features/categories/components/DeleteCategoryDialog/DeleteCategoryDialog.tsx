"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useDeleteCategory } from "@/features/categories/hooks/useCategoryMutations";
import type { CategorySummaryItem } from "@/features/categories/types";
import { showToast } from "@/lib/toast/toast";

type DeleteCategoryDialogProps = Readonly<{
  category: CategorySummaryItem | null;
  onOpenChange: (open: boolean) => void;
}>;

function describeImpact(count: number): string {
  if (count === 0) {
    return "Nenhuma transação usa esta categoria.";
  }

  return count === 1
    ? "A transação desta categoria será movida para “Outros”."
    : `As ${count} transações desta categoria serão movidas para “Outros”.`;
}

function DeleteCategoryDialog({
  category,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  async function handleConfirm() {
    if (!category) return;

    try {
      const result = await deleteCategory.mutateAsync(category.id);
      showToast.success({
        title: "Categoria excluída",
        description:
          result.movedCount > 0
            ? `${result.movedCount} transação(ões) movida(s) para ${result.movedTo.name}.`
            : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      showToast.error({
        title: "Não foi possível excluir a categoria",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir “{category?.name}”?</DialogTitle>
          <DialogDescription>
            {describeImpact(category?.totalTransactionCount ?? 0)} Essa ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteCategory.isPending}
            onClick={handleConfirm}
          >
            {deleteCategory.isPending ? "Excluindo…" : "Excluir categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteCategoryDialog };
