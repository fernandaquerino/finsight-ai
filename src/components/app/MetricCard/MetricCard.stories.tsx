import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowUpDownIcon,
  CreditCardIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import { MetricCard } from "./MetricCard";

const meta = {
  title: "App/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    label: "SALDO",
    value: "R$ 0",
    trend: "—",
    trendUp: true,
    icon: WalletIcon,
  },
  argTypes: {
    variant: { control: "select", options: ["default", "ai"] },
    trendUp: { control: "boolean" },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Balance: Story = {
  args: {
    label: "SALDO DO MÊS",
    value: "R$ 3.240",
    trend: "+12% vs. mês anterior",
    trendUp: true,
    icon: WalletIcon,
    iconClassName: "bg-primary-soft text-primary",
  },
};

export const Expenses: Story = {
  args: {
    label: "DESPESAS",
    value: "R$ 4.180",
    trend: "-8% vs. mês anterior",
    trendUp: false,
    icon: CreditCardIcon,
    iconClassName: "bg-danger-soft text-danger",
  },
};

export const Income: Story = {
  args: {
    label: "RECEITAS",
    value: "R$ 7.420",
    trend: "+5% vs. mês anterior",
    trendUp: true,
    icon: TrendingUpIcon,
    iconClassName: "bg-success-soft text-success",
  },
};

export const Transactions: Story = {
  args: {
    label: "TRANSAÇÕES",
    value: "47",
    trend: "+3 vs. mês anterior",
    trendUp: true,
    icon: ArrowUpDownIcon,
    iconClassName: "bg-muted text-muted-foreground",
  },
};

export const GridLayout: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid w-[600px] grid-cols-2 gap-4">
      <MetricCard
        label="SALDO"
        value="R$ 3.240"
        trend="+12%"
        trendUp
        icon={WalletIcon}
        iconClassName="bg-primary-soft text-primary"
      />
      <MetricCard
        label="DESPESAS"
        value="R$ 4.180"
        trend="-8%"
        trendUp={false}
        icon={CreditCardIcon}
        iconClassName="bg-danger-soft text-danger"
      />
      <MetricCard
        label="RECEITAS"
        value="R$ 7.420"
        trend="+5%"
        trendUp
        icon={TrendingUpIcon}
        iconClassName="bg-success-soft text-success"
      />
      <MetricCard
        label="TRANSAÇÕES"
        value="47"
        trend="+3"
        trendUp
        icon={ArrowUpDownIcon}
        iconClassName="bg-muted text-muted-foreground"
      />
    </div>
  ),
};
