import {
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { GOALS, type GoalKey } from "../../data/catalog";

const GOAL_ICONS: Record<GoalKey, LucideIcon> = {
  organize: ArrowLeftRight,
  save: PiggyBank,
  debts: CreditCard,
  subscriptions: RefreshCw,
  goals: Target,
  habits: Sparkles,
};

type GoalStepProps = Readonly<{
  selected: GoalKey | null;
  onSelect: (goal: GoalKey) => void;
}>;

export function GoalStep({ selected, onSelect }: GoalStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Qual é seu foco agora?
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha o objetivo principal — a IA prioriza insights para ele. Você
          pode mudar depois.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GOALS.map((goal) => {
          const Icon = GOAL_ICONS[goal.key];
          const isSelected = selected === goal.key;

          return (
            <button
              key={goal.key}
              type="button"
              onClick={() => onSelect(goal.key)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-muted-foreground/40",
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {goal.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {goal.description}
                </p>
              </div>
              {isSelected && (
                <CheckIcon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
