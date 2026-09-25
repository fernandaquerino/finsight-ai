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
import { useDeleteAccount } from "@/features/settings/hooks/useSettingsMutations";
import type { SettingsAccount } from "@/features/settings/types";
import { showToast } from "@/lib/toast/toast";

type DeleteBankAccountDialogProps = Readonly<{
  account: SettingsAccount | null;
  onOpenChange: (open: boolean) => void;
}>;

// Remoção de conta bancária. O servidor recusa (409) se a conta ainda tiver
// lançamentos — a mensagem dele é exibida como está, porque explica o que fazer.
function DeleteBankAccountDialog({
  account,
  onOpenChange,
}: DeleteBankAccountDialogProps) {
  const deleteAccount = useDeleteAccount();

  async function handleConfirm() {
    if (!account) return;

    try {
      await deleteAccount.mutateAsync(account.id);
      showToast.success({ title: "Conta removida", description: account.name });
      onOpenChange(false);
    } catch (error) {
      showToast.error({
        title: "Não foi possível remover a conta",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remover “{account?.name}”?</DialogTitle>
          <DialogDescription>
            A conta deixa de aparecer nos seus lançamentos e relatórios. Se ela
            ainda tiver transações, remova ou mova as transações primeiro.
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
            disabled={deleteAccount.isPending}
            onClick={handleConfirm}
          >
            {deleteAccount.isPending ? "Removendo…" : "Remover conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteBankAccountDialog };
