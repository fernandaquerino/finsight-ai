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
import { useDeleteDebt } from "@/features/debts/hooks/useDebtMutations";
import type { DebtSummaryItem } from "@/features/debts/types";
import { formatMoney } from "@/lib/money";
import { showToast } from "@/lib/toast/toast";

type DeleteDebtDialogProps = Readonly<{
  debt: DebtSummaryItem | null;
  onOpenChange: (open: boolean) => void;
}>;

function DeleteDebtDialog({ debt, onOpenChange }: DeleteDebtDialogProps) {
  const deleteDebt = useDeleteDebt();

  async function handleConfirm() {
    if (!debt) return;

    try {
      await deleteDebt.mutateAsync(debt.id);
      showToast.success({ title: "Dívida excluída", description: debt.name });
      onOpenChange(false);
    } catch (error) {
      showToast.error({
        title: "Não foi possível excluir a dívida",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={debt !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir “{debt?.name}”?</DialogTitle>
          <DialogDescription>
            {debt
              ? `Os ${formatMoney(debt.remainingAmount)} em aberto saem da estratégia de quitação e das métricas. Suas transações não são afetadas.`
              : null}
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
            disabled={deleteDebt.isPending}
            onClick={handleConfirm}
          >
            {deleteDebt.isPending ? "Excluindo…" : "Excluir dívida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteDebtDialog };
