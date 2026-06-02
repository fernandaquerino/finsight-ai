import type { Meta, StoryObj } from "@storybook/react";
import { TrendingUpIcon, UtensilsIcon } from "lucide-react";

import { TransactionAmount } from "@/components/app/TransactionAmount";
import { DataRow } from "@/components/app/DataRow";
import { DataList } from "./DataList";
import type { DataListProps } from "./DataList";

type Transaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
};

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "iFood",
    description: "Alimentação · 24 mai",
    amount: -52.9,
  },
  { id: "2", title: "Salário", description: "Receita · 01 mai", amount: 7420 },
  {
    id: "3",
    title: "Nubank Crédito",
    description: "Fatura · 03 mai",
    amount: -1840,
  },
  {
    id: "4",
    title: "Spotify",
    description: "Assinatura · recorrente",
    amount: -21.9,
  },
];

function TransactionDataList(props: DataListProps<Transaction>) {
  return <DataList {...props} />;
}

const meta = {
  title: "App/DataList",
  component: TransactionDataList,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    items: SAMPLE_TRANSACTIONS,
    ariaLabel: "Transações recentes",
    getKey: (item) => (item as Transaction).id,
    renderItem: (item) => (
      <DataRow
        icon={item.amount > 0 ? TrendingUpIcon : UtensilsIcon}
        iconClassName={
          item.amount > 0
            ? "bg-success-soft text-success"
            : "bg-danger-soft text-danger"
        }
        title={item.title}
        description={item.description}
        value={<TransactionAmount value={item.amount} />}
      />
    ),
  },
} satisfies Meta<typeof TransactionDataList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { items: [], isLoading: true },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyTitle: "Nenhuma transação encontrada",
    emptyDescription: "Tente ajustar os filtros ou adicionar um lançamento.",
  },
};

export const WithError: Story = {
  args: {
    items: [],
    error: "Não foi possível carregar as transações. Tente novamente.",
  },
};

export const ShortList: Story = {
  args: { items: SAMPLE_TRANSACTIONS.slice(0, 2) },
};
