"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { Button } from "@/components/ui/Button";
import {
  monthParamToString,
  type MonthParam,
} from "@/features/dashboard/month";

type DashboardHeaderProps = Readonly<{
  name?: string | null;
  month: MonthParam;
  monthLabel: string;
}>;

export function DashboardHeader({
  name,
  month,
  monthLabel,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Date determinístico (server/client) para o seletor.
  const selectedDate = new Date(month.year, month.month - 1, 1);

  function handleMonthChange(date: Date) {
    const next: MonthParam = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
    startTransition(() => {
      // Sincroniza o período na URL (deep-link + SSR refazem o fetch no servidor).
      router.push(`/?month=${monthParamToString(next)}`);
    });
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-medium text-foreground">
          Olá{name ? `, ${name}` : ""}
        </p>
        <p className="text-sm text-muted-foreground">
          {`Aqui está como ${monthLabel} está indo`}
        </p>
      </div>
      <div className="flex gap-2" data-pending={isPending ? "" : undefined}>
        <MonthYearPicker value={selectedDate} onChange={handleMonthChange} />
        <Button variant="secondary" size="sm" disabled>
          <Download />
          Exportar
        </Button>
      </div>
    </div>
  );
}
