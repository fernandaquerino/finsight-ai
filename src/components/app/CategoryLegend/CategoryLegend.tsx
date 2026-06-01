import { CategoryDot } from "@/components/app/CategoryDot";
import { MoneyText } from "@/components/app/MoneyText";
import { getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryLegendItem = Readonly<{
  category: string;
  value: number;
  percentage: number;
}>;

type CategoryLegendProps = Readonly<{
  data: readonly CategoryLegendItem[];
  activeIndex?: number;
  onHoverIndex?: (index: number | undefined) => void;
  className?: string;
}>;

function CategoryLegend({
  data,
  activeIndex,
  onHoverIndex,
  className,
}: CategoryLegendProps) {
  const hasActive = activeIndex !== undefined;

  return (
    <ul
      role="list"
      aria-label="Categorias de despesas"
      className={cn("space-y-3", className)}
    >
      {data.map((item, index) => {
        const isActive = activeIndex === index;
        const meta = getCategoryMeta(item.category);

        return (
          <li
            key={`${meta.key}-${index}`}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 transition-opacity duration-150",
              hasActive && !isActive ? "opacity-40" : "opacity-100",
            )}
            onMouseEnter={() => onHoverIndex?.(index)}
            onMouseLeave={() => onHoverIndex?.(undefined)}
          >
            <CategoryDot category={item.category} />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {meta.label}
            </span>
            <MoneyText
              value={item.value}
              tone="neutral"
              className="shrink-0 text-xs font-medium text-foreground"
            />
            <span className="w-7 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {item.percentage}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export { CategoryLegend };
export type { CategoryLegendItem };
