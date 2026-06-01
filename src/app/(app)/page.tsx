"use client";

import { Button } from "@/components/ui/Button";
import { getMonthAndYear, getMonthName, getToday } from "@/utils/date";
import { Calendar, ChevronDown, Download } from "lucide-react";

export default function DashboardPage() {
  const today = getToday();
  const currentMonth = getMonthName(today);
  const currentMonthAndYear = getMonthAndYear(today);

  return (
    <main className="mx-auto w-full max-w-7xl p-7">
      {/* Dashboard header */}
      <div className="flex items-center justify-between">
        {/* Nome do usuário, subtitulo */}
        <div>
          <p className="text-lg font-medium text-foreground">Olá, Marina</p>
          <p className="text-sm text-muted-foreground">
            {`Aqui está como ${currentMonth} está indo até agora`}
          </p>
        </div>
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Calendar />
            {currentMonthAndYear}
            <ChevronDown />
          </Button>
          <Button variant="secondary" size="sm">
            <Download />
            Exportar
          </Button>
        </div>
      </div>
    </main>
  );
}
