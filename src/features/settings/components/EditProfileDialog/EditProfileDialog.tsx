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
import { useUpdateSettings } from "@/features/settings/hooks/useSettingsMutations";
import type { SettingsProfile } from "@/features/settings/types";
import { showToast } from "@/lib/toast/toast";

// Espelha server/validators/settings (updateSettingsSchema). O servidor valida
// de novo — nunca só no cliente.
const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(120, "Use no máximo 120 caracteres"),
  phone: z
    .string()
    .trim()
    .max(24, "Telefone muito longo")
    .refine(
      (value) => value === "" || /^[\d\s()+-]+$/.test(value),
      "Use apenas números, espaços, parênteses, + e -",
    ),
  cpf: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.replace(/\D/g, "").length === 11,
      "O CPF deve ter 11 dígitos",
    ),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type EditProfileDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SettingsProfile;
}>;

function EditProfileForm({
  profile,
  onDone,
}: Readonly<{ profile: SettingsProfile; onDone: () => void }>) {
  const updateSettings = useUpdateSettings();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    // O CPF nasce vazio de propósito: a API nunca devolve o valor em claro, e
    // pré-preencher um campo com PII sensível é o que queremos evitar. Vazio
    // significa "manter o que já está salvo".
    defaultValues: {
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      cpf: "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateSettings.mutateAsync({
        name: values.name,
        phone: values.phone === "" ? null : values.phone,
        // Campo vazio não toca o CPF salvo. Para limpá-lo, o usuário usa o botão
        // dedicado na tela — apagar PII é uma ação explícita, não um efeito
        // colateral de salvar o perfil.
        ...(values.cpf === "" ? {} : { cpf: values.cpf }),
      });
      showToast.success({
        title: "Perfil atualizado",
        description: values.name,
      });
      onDone();
    } catch (error) {
      showToast.error({
        title: "Não foi possível atualizar o perfil",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      aria-busy={updateSettings.isPending || undefined}
    >
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Nome completo"
            required
            autoFocus
            maxLength={120}
            placeholder="Seu nome"
            error={errors.name?.message}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Input
        label="E-mail"
        value={profile.email}
        readOnly
        disabled
        helperText="O e-mail identifica sua conta e ainda não pode ser alterado aqui."
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Input
            label="Telefone"
            inputMode="tel"
            placeholder="+55 11 90000-0000"
            helperText="Opcional. Usado apenas para alertas que você ativar."
            error={errors.phone?.message}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <Input
            label="CPF"
            inputMode="numeric"
            autoComplete="off"
            placeholder={
              profile.hasCpf ? `Salvo: ${profile.cpfMasked}` : "000.000.000-00"
            }
            helperText={
              profile.hasCpf
                ? "Deixe em branco para manter o CPF já salvo."
                : "Opcional."
            }
            error={errors.cpf?.message}
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
        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize seus dados de conta. O CPF é opcional e fica guardado
            mascarado.
          </DialogDescription>
        </DialogHeader>
        {/* key remonta o form ao reabrir, descartando o rascunho anterior. */}
        <EditProfileForm
          key={open ? "open" : "closed"}
          profile={profile}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { EditProfileDialog };
