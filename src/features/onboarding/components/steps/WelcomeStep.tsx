import { ArrowLeftRight, BarChart3, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LogoMark } from "@/components/app/Icons/Logo";

const VALUE_PROPS: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: ArrowLeftRight,
    title: "Organize transações",
    description: "Importe extratos ou lance manualmente",
  },
  {
    icon: BarChart3,
    title: "Visualize tudo",
    description: "Dashboard, categorias e relatórios claros",
  },
  {
    icon: Sparkles,
    title: "Receba insights da IA",
    description: "Sempre com a fonte dos dados",
  },
];

type WelcomeStepProps = Readonly<{ name?: string | null }>;

export function WelcomeStep({ name }: WelcomeStepProps) {
  const firstName = name?.trim().split(" ")[0];

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <LogoMark className="size-9" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {firstName
            ? `Bem-vinda ao FinSight AI, ${firstName}`
            : "Bem-vinda ao FinSight AI"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Vamos configurar sua visão financeira em poucos passos. Leva menos de
          um minuto.
        </p>
      </div>

      <ul className="flex w-full flex-col gap-3 text-left">
        {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
