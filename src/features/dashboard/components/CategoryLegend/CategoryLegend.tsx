import type { CategoryData } from "@/features/dashboard/types/dashboard.types";
import { cn } from "@/lib/utils";

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
  const hasActive = activeIndex !== undefined;

  return (
    <ul
      role="list"
      aria-label="Categorias de despesas"
      className={cn("space-y-3", className)}
    >
      {data.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <li
            key={item.name}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 transition-opacity duration-150",
              hasActive && !isActive ? "opacity-40" : "opacity-100",
            )}
            onMouseEnter={() => onHoverIndex?.(index)}
            onMouseLeave={() => onHoverIndex?.(undefined)}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {item.name}
            </span>
            <span className="shrink-0 font-mono text-xs font-medium text-foreground tabular-nums">
              R$ {item.value.toLocaleString("pt-BR")}
            </span>
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
