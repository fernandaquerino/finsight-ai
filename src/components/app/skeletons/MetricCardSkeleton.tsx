import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function MetricCardSkeleton() {
  return (
    <Card padding="sm" aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-7 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export { MetricCardSkeleton };
