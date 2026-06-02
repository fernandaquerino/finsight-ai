import type { Meta, StoryObj } from "@storybook/react";
import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { AIInsightBanner } from "./AIInsightBanner";

const meta = {
  title: "App/AI/AIInsightBanner",
  component: AIInsightBanner,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    label: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof AIInsightBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMetric: Story = {
  args: {
    label: "RESUMO DA IA",
    title: "5 observações para você esta semana",
    description:
      "2 oportunidades, 2 pontos de atenção e 1 risco — revisadas com base no seu mês.",
    metric: { label: "ECONOMIA POTENCIAL", value: "R$ 1.352/ano" },
  },
};

export const WithAction: Story = {
  args: {
    label: "ANÁLISE DA IA",
    title: "Pague o cartão Nubank primeiro",
    description:
      "Entre suas dívidas, o cartão Nubank (13,9% a.m.) é o que mais custa. Antecipar R$ 300/mês nele economiza mais em juros do que adiantar qualquer outra.",
    source:
      "Estratégia avalanche · baseada nas taxas de juros das suas 4 dívidas",
    actionSlot: (
      <Button size="sm" variant="ai">
        <SparklesIcon />
        Simular quitação
      </Button>
    ),
  },
};

export const Minimal: Story = {
  args: {
    title: "Seu padrão de gastos está estável",
    description: "Nenhum alerta relevante identificado neste mês.",
  },
};
