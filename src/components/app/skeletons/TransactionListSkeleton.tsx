import { Skeleton } from "@/components/ui/Skeleton";

type TransactionListSkeletonProps = Readonly<{
  count?: number;
}>;

function TransactionListSkeleton({ count = 5 }: TransactionListSkeletonProps) {
  return (
    <ul
      aria-busy="true"
      aria-label="Carregando transações"
      className="space-y-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 py-1">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

export { TransactionListSkeleton };
