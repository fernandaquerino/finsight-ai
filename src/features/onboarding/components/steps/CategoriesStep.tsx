import { CheckIcon, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { SUGGESTED_CATEGORIES, type CategoryKey } from "../../data/catalog";

type CategoriesStepProps = Readonly<{
  selected: CategoryKey[];
  onToggle: (key: CategoryKey) => void;
}>;

export function CategoriesStep({ selected, onToggle }: CategoriesStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Quais categorias você quer acompanhar?
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione as que fazem sentido para você. Dá para ajustar a qualquer
          momento.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.key);

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onToggle(category.key)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary-soft text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              {category.name}
              {isSelected && (
                <CheckIcon className="size-3.5" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3">
        <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Conforme você importar transações, a IA sugere novas categorias
          automaticamente — você não precisa acertar tudo agora.
        </p>
      </div>
    </div>
  );
}
