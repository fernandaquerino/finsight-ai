"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { getMonthAndYear } from "@/utils/date";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

type MonthYearPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

function MonthYearPicker({ value, onChange }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());

  const selectedMonth = value.getMonth();
  const selectedYear = value.getFullYear();

  function handleOpenChange(next: boolean) {
    if (next) setViewYear(value.getFullYear());
    setOpen(next);
  }

  function handleSelect(monthIndex: number) {
    onChange(new Date(viewYear, monthIndex, 1));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm">
          <Calendar />
          {getMonthAndYear(value)}
          {open ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <div className="mb-3 flex items-center justify-between">
          <IconButton
            size="sm"
            aria-label="Ano anterior"
            onClick={() => setViewYear((y) => y - 1)}
          >
            <ChevronLeft />
          </IconButton>
          <span className="text-sm font-semibold tabular-nums">{viewYear}</span>
          <IconButton
            size="sm"
            aria-label="Próximo ano"
            onClick={() => setViewYear((y) => y + 1)}
          >
            <ChevronRight />
          </IconButton>
        </div>

        <div
          role="grid"
          aria-label="Selecionar mês"
          className="grid grid-cols-3 gap-1"
        >
          {MONTHS.map((month, index) => {
            const isSelected =
              index === selectedMonth && viewYear === selectedYear;

            return (
              <button
                key={month}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                onClick={() => handleSelect(index)}
                className={cn(
                  "rounded-md py-2 text-xs font-medium transition-colors",
                  "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:outline-none",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {month}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MonthYearPicker };
