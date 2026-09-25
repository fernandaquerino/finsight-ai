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
import { useDeleteGoal } from "@/features/goals/hooks/useGoalMutations";
import type { GoalSummaryItem } from "@/features/goals/types";
import { formatMoney } from "@/lib/money";
import { showToast } from "@/lib/toast/toast";

type DeleteGoalDialogProps = Readonly<{
  goal: GoalSummaryItem | null;
  onOpenChange: (open: boolean) => void;
}>;

function DeleteGoalDialog({ goal, onOpenChange }: DeleteGoalDialogProps) {
  const deleteGoal = useDeleteGoal();

  async function handleConfirm() {
    if (!goal) return;

    try {
      await deleteGoal.mutateAsync(goal.id);
      showToast.success({ title: "Meta excluída", description: goal.name });
      onOpenChange(false);
    } catch (error) {
      showToast.error({
        title: "Não foi possível excluir a meta",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={goal !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir “{goal?.name}”?</DialogTitle>
          <DialogDescription>
            {goal
              ? `Você deixa de acompanhar o progresso de ${formatMoney(goal.currentAmount)} guardados. Suas transações não são afetadas.`
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
            disabled={deleteGoal.isPending}
            onClick={handleConfirm}
          >
            {deleteGoal.isPending ? "Excluindo…" : "Excluir meta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteGoalDialog };
