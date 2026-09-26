"use client";

import Link from "next/link";

import { CategoryBadge } from "@/components/app/CategoryBadge";
import { SourceReference } from "@/components/app/SourceReference";
import { TransactionAmount } from "@/components/app/TransactionAmount";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { severityConfig } from "@/features/insights/components/InsightCard";
import type { Insight } from "@/features/insights/types";

type InsightDetailDialogProps = Readonly<{
  insight: Insight | null;
  onOpenChange: (open: boolean) => void;
}>;

// Detalhe do insight: o que foi observado, as evidências reais que sustentam o
// número e o que fazer. A ação é sempre navegação — a IA propõe, o usuário
// decide e age na tela do domínio. Nada é aplicado a partir daqui.
function InsightDetailDialog({
  insight,
  onOpenChange,
}: InsightDetailDialogProps) {
  return (
    <Dialog open={insight !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        {insight && (
          <>
            <DialogHeader>
              <DialogDescription>
                {severityConfig[insight.severity].label}
              </DialogDescription>
              <DialogTitle>{insight.title}</DialogTitle>
            </DialogHeader>

            <section
              aria-label="O que eu observei"
              className="rounded-lg border border-primary/20 bg-primary-soft/40 p-4"
            >
              <p className="text-[0.6875rem] font-medium tracking-[0.06em] text-primary uppercase">
                O que eu observei
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {insight.headline}
              </p>
            </section>

            {insight.evidence.length > 0 && (
              <section aria-label="Evidências">
                <p className="text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                  {`Evidências · ${insight.evidence.length} ${
                    insight.evidence.length === 1 ? "item" : "itens"
                  }`}
                </p>
                <ul className="mt-2 divide-y rounded-lg border">
                  {insight.evidence.map((item, index) => (
                    <li
                      key={`${item.description}-${index}`}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>

                      {item.categoryName && (
                        <CategoryBadge
                          category={item.categoryName}
                          className="hidden shrink-0 sm:inline-flex"
                        />
                      )}

                      <TransactionAmount
                        value={item.amount}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {insight.steps.length > 0 && (
              <section aria-label="Como resolver">
                <p className="text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                  Como resolver
                </p>
                <ol className="mt-2 flex flex-col gap-2">
                  {insight.steps.map((step, index) => (
                    <li key={step} className="flex items-center gap-2.5">
                      <span
                        className="flex size-[1.375rem] shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-[0.6875rem] font-semibold text-primary tabular-nums"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <SourceReference>{insight.source}</SourceReference>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  Fechar
                </Button>
              </DialogClose>

              {insight.action && (
                <Button size="sm" asChild>
                  <Link href={insight.action.href}>{insight.action.label}</Link>
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { InsightDetailDialog };
export type { InsightDetailDialogProps };
