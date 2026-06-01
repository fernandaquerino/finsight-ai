import { getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryDotProps = Readonly<{
  category: string;
  className?: string;
}>;

function CategoryDot({ category, className }: CategoryDotProps) {
  const meta = getCategoryMeta(category);

  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        meta.dotClassName,
        className,
      )}
      aria-hidden="true"
    />
  );
}

export { CategoryDot };
