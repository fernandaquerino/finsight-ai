"use client";

import { SparklesIcon } from "lucide-react";

import { SourceReference } from "@/components/app/SourceReference";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { DebtsSummary } from "@/features/debts/types";
import { formatMoney } from "@/lib/money";

type DebtStrategyPanelProps = Readonly<{
  summary: DebtsSummary;
  extraMonthlyInput: string;
  onExtraMonthlyChange: (value: string) => void;
}>;

function formatMonths(months: number | null): string {
  if (months === null) return "não quita";
  if (months === 0) return "quitado";

  return months === 1 ? "1 mês" : `${months} meses`;
}

// Painel da estratégia de quitação. Todos os números vêm da simulação
// determinística do servidor — o painel só formata e cita a fonte.
function DebtStrategyPanel({
  summary,
  extraMonthlyInput,
  onExtraMonthlyChange,
}: DebtStrategyPanelProps) {
  const { recommendation, simulation, comparison } = summary;

  if (!recommendation) return null;

  const rows = [
    {
      label: "Avalanche (maior juro primeiro)",
      simulation: comparison.avalanche,
      isRecommended: comparison.recommended === "avalanche",
    },
    {
      label: "Bola de neve (menor saldo primeiro)",
      simulation: comparison.snowball,
      isRecommended: comparison.recommended === "snowball",
    },
  ];

  return (
    <Card variant="ai" className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <SparklesIcon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <CardEyebrow className="text-primary">
            ESTRATÉGIA DE QUITAÇÃO
          </CardEyebrow>
          <h2 className="mt-1 text-base font-semibold text-foreground">
            {recommendation.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {recommendation.description}
          </p>
          <SourceReference className="mt-2">
            {recommendation.source}
          </SourceReference>
        </div>

        <div className="w-[168px] shrink-0">
          <Input
            label="Aporte extra por mês"
            prefix="R$"
            inputMode="decimal"
            placeholder="0,00"
            helperText="Simule pagar a mais."
            value={extraMonthlyInput}
            onChange={(event) => onExtraMonthlyChange(event.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <caption className="sr-only">
            Comparação entre as estratégias de quitação: tempo até zerar as
            dívidas e total de juros pagos
          </caption>
          <thead>
            <tr className="text-left text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              <th scope="col" className="pb-2 font-semibold">
                Estratégia
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Tempo
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Juros totais
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-primary/15">
                <th scope="row" className="py-2 pr-3 text-left font-medium">
                  {row.label}
                  {row.isRecommended ? (
                    <span className="ml-2 text-xs font-normal text-primary">
                      recomendada
                    </span>
                  ) : null}
                </th>
                <td className="py-2 text-right font-mono tabular-nums">
                  {formatMonths(row.simulation.months)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums">
                  {formatMoney(row.simulation.totalInterest)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        Simulação atual (
        {summary.strategy === "avalanche" ? "avalanche" : "bola de neve"}
        ): {formatMonths(simulation.months)} até zerar,{" "}
        {formatMoney(simulation.totalInterest)} de juros. Estimativa com base
        nos dados que você informou — não é aconselhamento financeiro
        profissional.
      </p>
    </Card>
  );
}

export { DebtStrategyPanel };
