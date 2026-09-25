"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";

import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

type SettingRowProps = Readonly<{
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  /** Ícone em tom de IA (accent) em vez do cinza neutro. */
  accent?: boolean;
  className?: string;
}>;

function SettingIcon({
  icon: Icon,
  accent,
}: Readonly<{ icon: LucideIcon; accent?: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-md",
        accent
          ? "bg-primary-soft text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

// Linha de configuração com ação livre (botão, badge, link). Usada nas duas
// telas do domínio — Configurações e Minha conta. As divisórias ficam no
// container (`divide-y divide-border`), não na linha: é o idioma já usado no
// projeto e evita que a primeira linha precise anular a própria borda.
function SettingRow({
  icon,
  title,
  description,
  action,
  accent,
  className,
}: SettingRowProps) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5", className)}>
      <SettingIcon icon={icon} accent={accent} />
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-foreground">{title}</p>
        <p className="text-small text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type SettingToggleProps = Readonly<{
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  accent?: boolean;
}>;

// Linha com Switch. O label do switch é o próprio título, ligado por
// aria-labelledby + aria-describedby — o usuário de leitor de tela ouve o que
// está ligando e o que aquilo faz, não só "switch".
function SettingToggle({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  accent,
}: SettingToggleProps) {
  // useId em vez de derivar do título: dois toggles com o mesmo texto na página
  // gerariam ids duplicados, e aí o aria-labelledby aponta para o lugar errado.
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <SettingIcon icon={icon} accent={accent} />
      <div className="min-w-0 flex-1">
        <p id={labelId} className="text-body font-medium text-foreground">
          {title}
        </p>
        <p id={descriptionId} className="text-small text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className="shrink-0"
      />
    </div>
  );
}

export { SettingRow, SettingToggle };
