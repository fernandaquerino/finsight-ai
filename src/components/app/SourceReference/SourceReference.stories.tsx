import type { Meta, StoryObj } from "@storybook/react";

import { SourceReference } from "./SourceReference";

const meta = {
  title: "App/AI/SourceReference",
  component: SourceReference,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SourceReference>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Transactions: Story = {
  args: { children: "Baseado em 28 transações de maio" },
};

export const Comparison: Story = {
  args: { children: "Comparação entre extrato e lançamento manual" },
};

export const Projection: Story = {
  args: { children: "Projeção com base nos aportes atuais" },
};

export const Strategy: Story = {
  args: {
    children:
      "Estratégia avalanche · baseada nas taxas de juros das suas 4 dívidas",
  },
};
