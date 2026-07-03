import type { ElementType } from "react";
import { FileUpIcon, LineChartIcon, SparklesIcon } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { appRoutes } from "@/lib/app-routes";

type QuickStep = Readonly<{
  icon: ElementType;
  title: string;
  description: string;
}>;

const quickSteps: readonly QuickStep[] = [
  {
    icon: FileUpIcon,
    title: "1. Traga seus dados",
    description:
      "Importe um extrato do banco ou registre seus primeiros gastos à mão. Você escolhe.",
  },
  {
    icon: LineChartIcon,
    title: "2. Veja para onde vai o dinheiro",
    description:
      "Assim que houver movimentações, os gráficos e categorias aparecem aqui automaticamente.",
  },
  {
    icon: SparklesIcon,
    title: "3. Converse com a IA",
    description:
      "Peça insights e sugestões — sempre com a fonte dos números, sem julgamentos.",
  },
];

export function DashboardEmptyState() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <EmptyState
        variant="dashboard"
        title="Vamos dar o primeiro passo juntos"
        description="Seu painel ganha vida assim que você adicionar movimentações. Comece importando um extrato ou lançando uma transação — leva menos de um minuto."
        primaryAction={{ label: "Importar extrato", href: "/imports" }}
        secondaryAction={{
          label: "Lançar manualmente",
          href: appRoutes.manualEntry,
        }}
        className="bg-card"
      />

      <section
        aria-label="Guia rápido para começar"
        className="grid gap-4 sm:grid-cols-3"
      >
        {quickSteps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4"
            >
              <div
                className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary"
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
