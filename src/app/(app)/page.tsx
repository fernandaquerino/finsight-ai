"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Download,
  MessageCircle,
  Sparkles,
  Wallet,
} from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getMonthName, getToday } from "@/utils/date";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const currentMonth = getMonthName(selectedDate);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-7">
      {/* Dashboard header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-foreground">Olá, Marina</p>
          <p className="text-sm text-muted-foreground">
            {`Aqui está como ${currentMonth} está indo até agora`}
          </p>
        </div>
        <div className="flex gap-2">
          <MonthYearPicker value={selectedDate} onChange={setSelectedDate} />
          <Button variant="secondary" size="sm">
            <Download />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Saldo total"
          value="R$ 14.821"
          trend="+4,2% este mês"
          trendUp
          icon={Wallet}
          iconClassName="bg-muted text-foreground"
        />
        <MetricCard
          label="Receitas no mês"
          value="R$ 10.290"
          trend="+6,1% vs. mês anterior"
          trendUp
          icon={ArrowUpRight}
          iconClassName="bg-success-soft text-success"
        />
        <MetricCard
          label="Despesas no mês"
          value="R$ 7.103"
          trend="-3,4% vs. mês anterior"
          trendUp={false}
          icon={ArrowDownRight}
          iconClassName="bg-warning-soft text-warning"
        />
        <MetricCard
          label="Economia estimada"
          value="R$ 1.240"
          trend="+12% pela IA"
          trendUp
          icon={Sparkles}
          iconClassName="bg-primary-soft text-primary"
          variant="ai"
        />
      </div>

      {/* AI Insight Banner */}
      <Card variant="ai" className="flex items-start gap-3">
        <div
          className="grid shrink-0 place-items-center rounded-[10.24px] text-white"
          style={{
            width: 32,
            height: 32,
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--ai-accent) 80%, #fff), var(--ai-accent))",
            boxShadow:
              "0 2px 8px color-mix(in srgb, var(--ai-accent) 40%, transparent)",
          }}
          aria-hidden="true"
        >
          <Sparkles className="size-4" />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
            Análise da IA
          </p>

          <p className="mb-2 text-sm font-semibold text-foreground">
            Você economizou R$ 268 a menos do que poderia em alimentação
          </p>
          <p className="text-sm text-muted-foreground">
            Seu mês está saudável: as despesas caíram{" "}
            <strong className="font-semibold text-foreground">3,4%</strong> e o
            saldo subiu. O ponto de atenção é alimentação,{" "}
            <strong className="font-semibold text-foreground">17% acima</strong>{" "}
            da sua média. Há também{" "}
            <strong className="font-semibold text-foreground">
              3 assinaturas
            </strong>{" "}
            que você pode revisar para liberar até{" "}
            <strong className="font-semibold text-foreground">
              R$ 112/mês
            </strong>
            .
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Database
              className="size-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">
              Baseado em 28 transações de maio e na sua média de 6 meses
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" className="text-xs">
              <Sparkles />
              Ver insights
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <MessageCircle />
              Perguntar à IA
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
