import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/Button";
import { EmptyList } from "./EmptyList";

const meta = {
  title: "Feedback/EmptyList",
  component: EmptyList,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "Nenhum item encontrado" },
} satisfies Meta<typeof EmptyList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Nenhuma transação encontrada",
    description: "Tente ajustar os filtros ou adicionar um novo lançamento.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Nenhuma meta criada",
    description: "Defina metas de economia para acompanhar seu progresso.",
    action: <Button size="sm">Criar primeira meta</Button>,
  },
};

export const FilterEmpty: Story = {
  args: {
    title: "Nenhum resultado",
    description: 'Nenhuma transação corresponde a "Mercado livre".',
  },
};

export const InsideList: Story = {
  render: () => (
    <div className="w-[480px] rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold">Transações recentes</p>
      </div>
      <EmptyList
        title="Nenhuma transação este mês"
        description="Importe um extrato ou adicione um lançamento manual."
        action={<Button size="sm">Adicionar transação</Button>}
        className="py-8"
      />
    </div>
  ),
};
