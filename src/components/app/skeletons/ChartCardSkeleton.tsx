import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function ChartCardSkeleton() {
  return (
    <Card className="space-y-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <Skeleton className="h-56 w-full" />
    </Card>
  );
}

export { ChartCardSkeleton };
