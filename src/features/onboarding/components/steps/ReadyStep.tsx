import { CheckCircle2, Folder, Sparkles, Tag, Target } from "lucide-react";

import {
  GOALS,
  SUGGESTED_CATEGORIES,
  type CategoryKey,
  type GoalKey,
} from "../../data/catalog";
import type { OnboardingAccountDraft } from "../../types";

const GOAL_TITLES = new Map(GOALS.map((goal) => [goal.key, goal.title]));
const CATEGORY_MAP = new Map(
  SUGGESTED_CATEGORIES.map((category) => [category.key, category]),
);

type ReadyStepProps = Readonly<{
  name?: string | null;
  goal: GoalKey | null;
  categoryKeys: CategoryKey[];
  accounts: OnboardingAccountDraft[];
}>;

export function ReadyStep({
  name,
  goal,
  categoryKeys,
  accounts,
}: ReadyStepProps) {
  const firstName = name?.trim().split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {firstName
              ? `Tudo pronto para começar, ${firstName}`
              : "Tudo pronto para começar"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu dashboard já está preparado para receber suas primeiras
            transações.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {goal && (
          <SummaryRow icon={Target} label="Seu foco">
            <span className="text-sm font-medium text-foreground">
              {GOAL_TITLES.get(goal)}
            </span>
          </SummaryRow>
        )}

        {categoryKeys.length > 0 && (
          <SummaryRow icon={Tag} label="Categorias">
            <div className="flex flex-wrap gap-1.5">
              {categoryKeys.map((key) => {
                const category = CATEGORY_MAP.get(key);
                if (!category) {
                  return null;
                }

                return (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 text-sm text-foreground"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {category.name}
                  </span>
                );
              })}
            </div>
          </SummaryRow>
        )}

        {accounts.length > 0 && (
          <SummaryRow
            icon={Folder}
            label={
              accounts.length === 1 ? "1 conta" : `${accounts.length} contas`
            }
          >
            <span className="text-sm font-medium text-foreground">
              {accounts.map((account) => account.name).join(", ")}
            </span>
          </SummaryRow>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-primary-soft/40 p-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Sparkles className="size-4" />
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">
            Próximo passo:
          </strong>{" "}
          adicione sua primeira transação. Com poucos lançamentos a IA já começa
          a gerar seus primeiros insights.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  children,
}: Readonly<{
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </div>
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
