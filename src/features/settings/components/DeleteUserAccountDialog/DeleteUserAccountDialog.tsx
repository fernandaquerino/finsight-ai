"use client";

import { useRef, useState } from "react";
import {
  DatabaseIcon,
  DownloadIcon,
  LandmarkIcon,
  Trash2Icon,
} from "lucide-react";

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
import { useDeleteUserAccount } from "@/features/settings/hooks/useSettingsMutations";
import { showToast } from "@/lib/toast/toast";

const CONFIRMATION_WORD = "ENCERRAR";

type DeleteUserAccountDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountCount: number;
  onExportRequest: () => void;
}>;

function DeleteUserAccountDialog({
  open,
  onOpenChange,
  accountCount,
  onExportRequest,
}: DeleteUserAccountDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const deleteUserAccount = useDeleteUserAccount();
  const logoutFormRef = useRef<HTMLFormElement>(null);

  // Comparação exata, sem normalizar caixa — igual ao validator do servidor.
  const canConfirm = confirmation === CONFIRMATION_WORD;

  const consequences = [
    {
      icon: Trash2Icon,
      text: "Todas as transações, categorias, metas e dívidas serão apagadas",
    },
    {
      icon: LandmarkIcon,
      text:
        accountCount === 1
          ? "Sua conta cadastrada será removida"
          : `Suas ${accountCount} contas cadastradas serão removidas`,
    },
    {
      icon: DatabaseIcon,
      text: "Esta ação é permanente e não pode ser desfeita",
    },
  ];

  async function handleConfirm() {
    try {
      await deleteUserAccount.mutateAsync(confirmation);
      // Força o logout: com sessão JWT o cookie continuaria válido depois do
      // delete. /logout já chama signOut e redireciona.
      logoutFormRef.current?.requestSubmit();
    } catch (error) {
      showToast.error({
        title: "Não foi possível encerrar a conta",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) setConfirmation("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Encerrar conta</DialogTitle>
          <DialogDescription>
            Tem certeza? Esta ação é permanente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <ul className="grid gap-3 rounded-md border border-danger/20 bg-danger-soft px-4 py-3.5">
            {consequences.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground"
              >
                <item.icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-danger"
                />
                {item.text}
              </li>
            ))}
          </ul>

          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
            <DownloadIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span>
              Prefere guardar seus dados antes?{" "}
              <button
                type="button"
                onClick={() => {
                  handleOpenChange(false);
                  onExportRequest();
                }}
                className="font-medium text-primary underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Exportar tudo
              </button>{" "}
              antes de encerrar.
            </span>
          </p>

          <Input
            label={`Para confirmar, digite ${CONFIRMATION_WORD}`}
            autoFocus
            autoComplete="off"
            placeholder={CONFIRMATION_WORD}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Manter minha conta
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canConfirm || deleteUserAccount.isPending}
            onClick={handleConfirm}
          >
            <Trash2Icon aria-hidden="true" />
            {deleteUserAccount.isPending ? "Encerrando…" : "Encerrar conta"}
          </Button>
        </DialogFooter>

        {/* Submetido via JS depois do DELETE — reusa a rota de logout existente. */}
        <form ref={logoutFormRef} action="/logout" method="post" hidden />
      </DialogContent>
    </Dialog>
  );
}

export { DeleteUserAccountDialog };
