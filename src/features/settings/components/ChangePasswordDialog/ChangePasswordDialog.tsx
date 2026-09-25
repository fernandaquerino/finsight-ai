"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
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
import { SettingsRequestError } from "@/features/settings/hooks/request";
import { useChangePassword } from "@/features/settings/hooks/useSettingsMutations";
import { showToast } from "@/lib/toast/toast";
import { cn } from "@/lib/utils";

// Espelha changePasswordSchema de server/validators/settings.
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "A senha precisa de ao menos 8 caracteres")
      .regex(/[A-Za-z]/, "Use ao menos uma letra")
      .regex(/\d/, "Use ao menos um número"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "A nova senha precisa ser diferente da atual",
    path: ["newPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const STRENGTH_LEVELS = [
  { label: "muito fraca", className: "bg-danger", text: "text-danger" },
  { label: "fraca", className: "bg-danger", text: "text-danger" },
  { label: "razoável", className: "bg-warning", text: "text-warning" },
  { label: "boa", className: "bg-info", text: "text-info" },
  { label: "forte", className: "bg-success", text: "text-success" },
] as const;

// Heurística de força, só para orientar quem está escolhendo a senha. Não
// substitui a validação: o mínimo real é imposto pelo schema, nos dois lados.
function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function StrengthMeter({ password }: Readonly<{ password: string }>) {
  if (password === "") return null;

  const score = passwordStrength(password);
  const level = STRENGTH_LEVELS[score] ?? STRENGTH_LEVELS[0];

  return (
    <div>
      <div className="mb-1.5 flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index < score ? level.className : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", level.text)} aria-live="polite">
        Força: {level.label}
      </p>
    </div>
  );
}

type ChangePasswordDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

function ChangePasswordForm({ onDone }: Readonly<{ onDone: () => void }>) {
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";

  async function onSubmit(values: PasswordFormValues) {
    try {
      await changePassword.mutateAsync(values);
      showToast.success({
        title: "Senha alterada",
        description: "Você continua conectado neste dispositivo.",
      });
      onDone();
    } catch (error) {
      // A senha atual errada é erro de campo, não de sistema: mostra no input em
      // vez de num toast solto.
      const message = error instanceof Error ? error.message : undefined;
      if (
        error instanceof SettingsRequestError &&
        error.code === "INVALID_CURRENT_PASSWORD"
      ) {
        setError("currentPassword", {
          message: message ?? "A senha atual está incorreta.",
        });
        return;
      }

      showToast.error({
        title: "Não foi possível alterar a senha",
        description: message,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      aria-busy={changePassword.isPending || undefined}
    >
      <Controller
        control={control}
        name="currentPassword"
        render={({ field }) => (
          <Input
            label="Senha atual"
            required
            autoFocus
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <div className="grid gap-2">
        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <Input
              label="Nova senha"
              required
              type="password"
              autoComplete="new-password"
              helperText="Ao menos 8 caracteres, com letras e números."
              error={errors.newPassword?.message}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <StrengthMeter password={newPassword} />
      </div>

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Input
            label="Confirmar nova senha"
            required
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
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
        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Escolha uma senha forte que você não usa em outro lugar.
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao reabrir: nenhum rascunho de senha fica em memória. */}
        <ChangePasswordForm
          key={open ? "open" : "closed"}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { ChangePasswordDialog };
