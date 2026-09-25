"use client";

import { useState } from "react";

import { DonutChart } from "@/components/charts/DonutChart";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CategorySpendSlice = Readonly<{
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}>;

type CategorySpendDonutProps = Readonly<{
  slices: readonly CategorySpendSlice[];
  ariaLabel: string;
  className?: string;
}>;

// Rosca de composição + legenda. Os dados chegam prontos (nenhuma regra de
// negócio aqui). A legenda usa o nome e a cor da própria categoria — não o mapa
// fixo de `lib/categories` — porque categorias são criadas pelo usuário.
// O wrap é o do design: lado a lado quando cabe, empilhado em cards estreitos.
function CategorySpendDonut({
  slices,
  ariaLabel,
  className,
}: CategorySpendDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const hasActive = activeIndex !== undefined;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-[22px]", className)}
      onMouseLeave={() => setActiveIndex(undefined)}
    >
      <div className="mx-auto w-[180px] shrink-0">
        <DonutChart
          data={slices.map((slice) => ({
            name: slice.name,
            value: slice.value,
            percentage: slice.percentage,
            color: slice.color,
          }))}
          height={180}
          activeIndex={activeIndex}
          aria-label={ariaLabel}
        />
      </div>

      <ul role="list" className="min-w-[150px] flex-1 space-y-[7px]">
        {slices.map((slice, index) => (
          <li
            key={slice.id}
            className={cn(
              "flex items-center gap-[9px] transition-opacity duration-150",
              hasActive && activeIndex !== index ? "opacity-50" : "opacity-100",
            )}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span
              aria-hidden="true"
              className="size-[9px] shrink-0 rounded-[3px]"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
              {slice.name}
            </span>
            <span className="shrink-0 font-mono text-[13px] font-medium text-foreground tabular-nums">
              {formatMoney(slice.value)}
            </span>
            <span className="w-[30px] shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
              {slice.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { CategorySpendDonut };
