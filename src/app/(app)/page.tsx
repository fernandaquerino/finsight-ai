"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Sparkles,
  Wallet,
} from "lucide-react";

import { MetricCard } from "@/components/app/MetricCard";
import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { Button } from "@/components/ui/Button";
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
    </main>
  );
}
