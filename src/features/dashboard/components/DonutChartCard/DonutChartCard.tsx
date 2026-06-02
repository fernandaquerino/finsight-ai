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
          className="group gap-0.5 text-xs text-muted-foreground"
        >
          Detalhes
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="w-full max-w-48 shrink-0 lg:w-[200px]">
          <DonutChart
            data={data}
            height={200}
            activeIndex={activeIndex}
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
