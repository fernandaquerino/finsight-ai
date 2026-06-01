import { Badge } from "@/components/ui/Badge";
import { getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = Readonly<{
  category: string;
  className?: string;
}>;

function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const meta = getCategoryMeta(category);

  return (
    <Badge className={cn("gap-1.5", meta.badgeClassName, className)}>
      <span
        className={cn("size-1.5 rounded-full", meta.dotClassName)}
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  );
}

export { CategoryBadge };
