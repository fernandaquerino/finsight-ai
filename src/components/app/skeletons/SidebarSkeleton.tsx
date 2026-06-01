import { Skeleton } from "@/components/ui/Skeleton";

function SidebarSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col"
    >
      <div className="flex h-14 items-center border-b px-4">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex-1 space-y-6 px-3 py-4">
        {Array.from({ length: 4 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            <Skeleton className="mx-3 h-3 w-20" />
            {Array.from({ length: 3 }).map((__, itemIndex) => (
              <Skeleton key={itemIndex} className="h-9 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <Skeleton className="h-9 w-full" />
      </div>
    </aside>
  );
}

export { SidebarSkeleton };
