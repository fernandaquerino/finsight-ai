import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/Button";
import { ChartCard } from "./ChartCard";

const meta = {
  title: "App/Dashboard/ChartCard",
  component: ChartCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    isLoading: { control: "boolean" },
    isEmpty: { control: "boolean" },
  },
} satisfies Meta<typeof ChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Evolução mensal",
    subtitle: "Receitas vs. despesas dos últimos 6 meses",
    children: (
      <div className="flex h-60 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Gráfico aqui
      </div>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: "Despesas por categoria",
    subtitle: "Maio 2025",
    action: (
      <Button variant="outline" size="sm">
        Ver detalhes
      </Button>
    ),
    children: (
      <div className="flex h-60 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Gráfico de pizza aqui
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    title: "Evolução mensal",
    subtitle: "Carregando dados…",
    isLoading: true,
    children: null,
  },
};

export const Empty: Story = {
  args: {
    title: "Evolução mensal",
    subtitle: "Junho 2025",
    isEmpty: true,
    children: null,
  },
};

export const EmptyCustomMessage: Story = {
  args: {
    title: "Relatório de metas",
    isEmpty: true,
    emptyMessage: "Nenhuma meta cadastrada ainda",
    children: null,
  },
};
