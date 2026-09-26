import type { Meta, StoryObj } from "@storybook/react";

import type { Insight } from "@/features/insights/types";

import { InsightCard } from "./InsightCard";

// Dados fictícios — nunca usar dados financeiros reais em fixtures.
const baseInsight: Insight = {
  id: "recurring-charges:2026-05",
  kind: "recurring-charges",
  severity: "opportunity",
  title: "Cobranças recorrentes que valem uma revisão",
  reason: "Encontrei 3 cobranças que se repetem todo mês e somam R$ 112,70.",
  headline: "Essas 3 cobranças custam R$ 112,70 por mês.",
  impact: 112.7,
  impactDirection: "savings",
  impactPeriod: "monthly",
  impactLabel: "até R$ 1.352,40/ano",
  source: "Baseado em 9 cobranças repetidas dos últimos 3 meses",
  evidence: [],
  steps: [],
  action: null,
};

const meta = {
  title: "Features/Insights/InsightCard",
  component: InsightCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { insight: baseInsight, onOpenDetail: () => {} },
} satisfies Meta<typeof InsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opportunity: Story = {};

export const Risk: Story = {
  args: {
    insight: {
      ...baseInsight,
      id: "possible-duplicate:2026-05:t1-t2",
      kind: "possible-duplicate",
      severity: "risk",
      title: "Possível duplicidade em lançamento",
      reason: "Encontrei 1 lançamento que pode estar lançado duas vezes.",
      impact: 210,
      impactDirection: "review",
      impactPeriod: "one-off",
      impactLabel: "R$ 210,00 em dúvida",
      source:
        "Comparação de valor, descrição e data entre lançamentos de mai 2026",
    },
  },
};

export const Attention: Story = {
  args: {
    insight: {
      ...baseInsight,
      id: "category-above-average:cat-food:2026-05",
      kind: "category-above-average",
      severity: "attention",
      title: "Alimentação acima da sua média",
      reason:
        "Seu gasto com Alimentação ficou 17% acima da média dos últimos 5 meses.",
      impact: 268,
      impactDirection: "overspend",
      impactPeriod: "one-off",
      impactLabel: "R$ 268,00 a mais",
      source: "Comparação entre mai 2026 e a média de 5 meses anteriores",
    },
  },
};

export const Info: Story = {
  args: {
    insight: {
      ...baseInsight,
      id: "new-recurring:smart fit:2026-05",
      kind: "new-recurring",
      severity: "info",
      title: "Nova cobrança recorrente identificada",
      reason: "“Smart Fit” apareceu em 3 meses seguidos pelo mesmo valor.",
      impact: 0,
      impactDirection: "none",
      impactLabel: "classificada em Saúde",
      source: "Baseado em 3 cobranças de mar 2026 a mai 2026",
    },
  },
};
