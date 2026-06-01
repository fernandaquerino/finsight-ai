"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { ChartCard } from "@/components/app/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { CategoryLegend } from "@/features/dashboard/components/CategoryLegend";
import { Button } from "@/components/ui/Button";
import {
  MOCK_CATEGORY_DATA,
  type CategoryData,
} from "@/features/dashboard/types/dashboard.types";

type DonutChartCardProps = {
  data?: CategoryData[];
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
};

function DonutChartCard({
  data = MOCK_CATEGORY_DATA,
  isLoading = false,
  isEmpty = false,
  className,
}: DonutChartCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const activeItem = activeIndex !== undefined ? data[activeIndex] : undefined;

  return (
    <ChartCard
      title="Para onde foi o dinheiro"
      subtitle="Despesas por categoria"
      isLoading={isLoading}
      isEmpty={isEmpty}
      className={className}
      action={
        <Button
          variant="ghost"
          size="sm"
          className="group h-auto gap-0.5 p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          Detalhes
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <div className="w-[200px] shrink-0">
          <DonutChart
            data={data}
            height={200}
            activeItem={activeItem}
            aria-label="Gráfico de rosca de despesas por categoria"
          />
        </div>
        <CategoryLegend
          data={data}
          activeIndex={activeIndex}
          onHoverIndex={setActiveIndex}
          className="min-w-0 flex-1"
        />
      </div>
    </ChartCard>
  );
}

export { DonutChartCard };
