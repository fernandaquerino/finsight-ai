"use client";

import { FileTextIcon, LayersIcon, PencilIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type TransactionOrigin =
  | "manual"
  | "import"
  | "recurring"
  | "integration";

export type TransactionFilters = {
  search?: string;
  from?: string;
  to?: string;
  kind?: "income" | "expense" | "transfer";
  origin?: TransactionOrigin;
  categoryId?: string;
  accountId?: string;
};

type FilterOption = {
  value: string;
  label: string;
  color?: string | null;
};

type DataFilterBarProps = Readonly<{
  filters: TransactionFilters;
  categoryOptions?: FilterOption[];
  accountOptions?: FilterOption[];
  onFiltersChange: (filters: TransactionFilters) => void;
}>;

type ChipProps = Readonly<{
  active?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  color?: string | null;
  onClick: () => void;
}>;

function cleanFilters(filters: TransactionFilters): TransactionFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => Boolean(value)),
  ) as TransactionFilters;
}

function FilterChip({
  active = false,
  children,
  icon: Icon,
  color,
  onClick,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-primary/55 bg-primary-soft text-primary"
          : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
      {color ? (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}

function DataFilterBar({
  filters,
  categoryOptions = [],
  onFiltersChange,
}: DataFilterBarProps) {
  function patch(next: TransactionFilters) {
    onFiltersChange(cleanFilters({ ...filters, ...next }));
  }

  return (
    <section
      aria-label="Filtros de transações"
      className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
    >
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={!filters.kind && !filters.categoryId}
          icon={LayersIcon}
          onClick={() => onFiltersChange({})}
        >
          Todas
        </FilterChip>
        <FilterChip
          active={filters.kind === "income"}
          onClick={() => patch({ kind: "income", categoryId: undefined })}
        >
          Receitas
        </FilterChip>
        <FilterChip
          active={filters.kind === "expense"}
          onClick={() => patch({ kind: "expense", categoryId: undefined })}
        >
          Despesas
        </FilterChip>

        {categoryOptions.length > 0 ? (
          <span
            className="mx-1 hidden h-6 w-px shrink-0 bg-border sm:block"
            aria-hidden="true"
          />
        ) : null}

        {categoryOptions.slice(0, 4).map((category) => (
          <FilterChip
            key={category.value}
            active={filters.categoryId === category.value}
            color={category.color}
            onClick={() =>
              patch({
                categoryId:
                  filters.categoryId === category.value
                    ? undefined
                    : category.value,
              })
            }
          >
            {category.label}
          </FilterChip>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:justify-end">
        <FilterChip
          active={filters.origin === "import"}
          icon={FileTextIcon}
          onClick={() =>
            patch({
              origin: filters.origin === "import" ? undefined : "import",
            })
          }
        >
          Extrato
        </FilterChip>
        <FilterChip
          active={filters.origin === "manual"}
          icon={PencilIcon}
          onClick={() =>
            patch({
              origin: filters.origin === "manual" ? undefined : "manual",
            })
          }
        >
          Manual
        </FilterChip>
      </div>
    </section>
  );
}

export { DataFilterBar, cleanFilters };
