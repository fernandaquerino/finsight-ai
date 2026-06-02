import type { Meta, StoryObj } from "@storybook/react";

import { TransactionAmount } from "./TransactionAmount";

const meta = {
  title: "App/TransactionAmount",
  component: TransactionAmount,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: "number" },
    type: {
      control: "select",
      options: ["income", "expense", "neutral"],
    },
  },
} satisfies Meta<typeof TransactionAmount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Income: Story = {
  args: { value: 3500, type: "income" },
};

export const Expense: Story = {
  args: { value: 89.9, type: "expense" },
};

export const Neutral: Story = {
  args: { value: 0, type: "neutral" },
};

export const AutoDetected: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-2">
      <TransactionAmount value={3500} />
      <TransactionAmount value={-89.9} />
      <TransactionAmount value={0} />
    </div>
  ),
};
