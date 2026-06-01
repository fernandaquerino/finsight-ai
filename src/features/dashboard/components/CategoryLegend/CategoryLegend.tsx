import {
  CategoryLegend as AppCategoryLegend,
  type CategoryLegendItem,
} from "@/components/app/CategoryLegend";
import type { CategoryData } from "@/features/dashboard/types/dashboard.types";

type CategoryLegendProps = {
  data: CategoryData[];
  activeIndex?: number;
  onHoverIndex?: (index: number | undefined) => void;
  className?: string;
};

function CategoryLegend({
  data,
  activeIndex,
  onHoverIndex,
  className,
}: CategoryLegendProps) {
  const legendData: CategoryLegendItem[] = data.map((item) => ({
    category: item.name,
    value: item.value,
    percentage: item.percentage,
  }));

  return (
    <AppCategoryLegend
      data={legendData}
      activeIndex={activeIndex}
      onHoverIndex={onHoverIndex}
      className={className}
    />
  );
}

export { CategoryLegend };
