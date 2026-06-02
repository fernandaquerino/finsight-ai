import type { Meta, StoryObj } from "@storybook/react";

import { AIInsightCard } from "./AIInsightCard";

const meta = {
  title: "App/AI/AIInsightCard",
  component: AIInsightCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    type: "info",
    title: "Insight",
    description: "Descrição do insight.",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["opportunity", "attention", "risk", "info"],
    },
    status: {
      control: "select",
      options: ["new", "applied"],
    },
  },
} satisfies Meta<typeof AIInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opportunity: Story = {
  args: {
    type: "opportunity",
    title: "Assinaturas que você pode revisar",
    description:
      "Identifiquei 3 assinaturas com baixo uso recente que somam um custo recorrente. Spotify, Netflix e um app de produtividade — R$ 112,70/mês juntos.",
    highlight: { value: "até R$ 1.352/ano", variant: "success" },
    source: "Baseado em 9 cobranças recorrentes dos últimos 3 meses",
    actionLabel: "Ver como economizar",
    actionHref: "/insights/1",
  },
};

export const Attention: Story = {
  args: {
    type: "attention",
    title: "Alimentação acima da sua média",
    description:
      "Seu gasto com alimentação ficou 17% acima da sua média dos últimos 6 meses. R$ 1.842 em maio vs. média de R$ 1.574.",
    highlight: { value: "R$ 268 a mais", variant: "warning" },
    source: "Baseado em 28 transações de maio",
    actionLabel: "Ver detalhes",
    actionHref: "/insights/2",
  },
};

export const Risk: Story = {
  args: {
    type: "risk",
    title: "Possível duplicidade em lançamento",
    description:
      'Dois lançamentos parecidos podem ser a mesma compra. "Posto Shell — R$ 210,00" aparece em 29 e 30 de maio.',
    highlight: { value: "R$ 210 em dúvida", variant: "danger" },
    source: "Comparação entre extrato e lançamento manual",
    actionLabel: "Revisar agora",
    actionHref: "/insights/3",
  },
};

export const Info: Story = {
  args: {
    type: "info",
    title: "Assinatura recorrente identificada",
    description:
      "Detectei uma nova cobrança mensal e a classifiquei automaticamente. Smart Fit — R$ 129,90, todo dia 25.",
    source: "Baseado em 3 cobranças consecutivas",
    actionLabel: "Ver detalhes",
    actionHref: "/insights/4",
  },
};

export const Applied: Story = {
  args: {
    type: "info",
    status: "applied",
    title: "Assinatura recorrente identificada",
    description: "Smart Fit — R$ 129,90, todo dia 25. Categorizada como Saúde.",
    source: "Baseado em 3 cobranças consecutivas",
  },
};

export const GridShowcase: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid w-[960px] grid-cols-3 gap-4">
      <AIInsightCard
        type="opportunity"
        title="Assinaturas revisáveis"
        description="3 assinaturas com baixo uso somam R$ 112,70/mês."
        highlight={{ value: "até R$ 1.352/ano", variant: "success" }}
        source="9 cobranças dos últimos 3 meses"
        actionLabel="Ver como economizar"
        actionHref="/insights/1"
      />
      <AIInsightCard
        type="attention"
        title="Alimentação acima da média"
        description="R$ 1.842 em maio vs. média de R$ 1.574."
        highlight={{ value: "R$ 268 a mais", variant: "warning" }}
        source="28 transações de maio"
        actionLabel="Ver detalhes"
        actionHref="/insights/2"
      />
      <AIInsightCard
        type="risk"
        title="Possível duplicidade"
        description='Posto Shell — R$ 210,00" em 29 e 30 de maio.'
        highlight={{ value: "R$ 210 em dúvida", variant: "danger" }}
        source="Comparação entre extratos"
        actionLabel="Revisar agora"
        actionHref="/insights/3"
      />
    </div>
  ),
};
