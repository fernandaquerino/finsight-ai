import type { Meta, StoryObj } from "@storybook/react";
import {
  CreditCardIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UtensilsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { TransactionAmount } from "@/components/app/TransactionAmount";
import { CategoryBadge } from "@/components/app/CategoryBadge";
import { DataRow } from "./DataRow";

const meta = {
  title: "App/DataRow",
  component: DataRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "Título do item" },
} satisfies Meta<typeof DataRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "iFood",
    description: "Alimentação · 24 mai",
    icon: UtensilsIcon,
    iconClassName: "bg-success-soft text-success",
    value: <TransactionAmount value={-52.9} />,
  },
};

export const WithoutIcon: Story = {
  args: {
    title: "Transferência recebida",
    description: "Crédito · 01 jun",
    value: <TransactionAmount value={3500} />,
  },
};

export const WithBadge: Story = {
  args: {
    title: "Nubank Crédito",
    description: "Parcela 2/12 · 03 jun",
    icon: CreditCardIcon,
    iconClassName: "bg-danger-soft text-danger",
    value: <TransactionAmount value={-550} />,
    action: <CategoryBadge category="moradia" />,
  },
};

export const WithAction: Story = {
  args: {
    title: "Spotify",
    description: "Assinatura · recorrente",
    icon: ShoppingCartIcon,
    value: <TransactionAmount value={-21.9} />,
    action: (
      <Button variant="ghost" size="sm">
        Revisar
      </Button>
    ),
  },
};

export const TransactionList: Story = {
  render: () => (
    <ul className="w-[480px] divide-y divide-border rounded-lg border">
      <DataRow
        icon={UtensilsIcon}
        iconClassName="bg-success-soft text-success"
        title="iFood"
        description="Alimentação · 24 mai"
        value={<TransactionAmount value={-52.9} />}
      />
      <DataRow
        icon={TrendingUpIcon}
        iconClassName="bg-primary-soft text-primary"
        title="Salário"
        description="Receita · 01 mai"
        value={<TransactionAmount value={7420} />}
      />
      <DataRow
        icon={CreditCardIcon}
        iconClassName="bg-danger-soft text-danger"
        title="Nubank Crédito"
        description="Fatura · 03 mai"
        value={<TransactionAmount value={-1840} />}
      />
    </ul>
  ),
};
