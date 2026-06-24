import { Database, Lock, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Switch } from "@/components/ui/Switch";

const PRIVACY_POINTS: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Database,
    title: "Seus dados são seus",
    description:
      "Ficam isolados na sua conta. Nunca compartilhamos com outros usuários.",
  },
  {
    icon: Sparkles,
    title: "A IA responde com números reais",
    description:
      "As respostas vêm dos seus dados, sempre citando a fonte — nada é inventado.",
  },
  {
    icon: Lock,
    title: "Sem dados sensíveis em logs",
    description:
      "Valores e descrições de transações nunca aparecem em registros internos.",
  },
];

type ConsentStepProps = Readonly<{
  consent: boolean;
  onChange: (value: boolean) => void;
}>;

export function ConsentStep({ consent, onChange }: ConsentStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Privacidade e uso de IA
        </h1>
        <p className="text-sm text-muted-foreground">
          Antes de usar os recursos de IA, precisamos do seu consentimento.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {PRIVACY_POINTS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 p-4">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Autorizo o uso dos meus dados pela IA
          </p>
          <p className="text-sm text-muted-foreground">
            Você pode revogar isso depois nas configurações. Sem consentimento,
            os recursos de IA ficam desativados.
          </p>
        </div>
        <Switch
          checked={consent}
          onCheckedChange={onChange}
          aria-label="Autorizo o uso dos meus dados pela IA"
        />
      </label>
    </div>
  );
}
