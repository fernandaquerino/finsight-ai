"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { MonthYearPicker } from "@/components/app/MonthYearPicker";
import { Button } from "@/components/ui/Button";
import { getMonthName, getToday } from "@/utils/date";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const currentMonth = getMonthName(selectedDate);

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
          <MonthYearPicker value={selectedDate} onChange={setSelectedDate} />
          <Button variant="secondary" size="sm">
            <Download />
            Exportar
          </Button>
        </div>
      </div>
    </main>
  );
}
