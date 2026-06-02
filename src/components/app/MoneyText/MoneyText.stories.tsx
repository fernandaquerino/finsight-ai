import type { Meta, StoryObj } from "@storybook/react";

import { MoneyText } from "./MoneyText";

const meta = {
  title: "App/MoneyText",
  component: MoneyText,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    value: { control: "number" },
    tone: {
      control: "select",
      options: ["auto", "positive", "negative", "neutral"],
    },
    showSign: { control: "boolean" },
  },
} satisfies Meta<typeof MoneyText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: { value: 5420.5, tone: "auto" },
};

export const Negative: Story = {
  args: { value: -342.9, tone: "auto" },
};

export const Neutral: Story = {
  args: { value: 1200, tone: "neutral" },
};

export const WithSign: Story = {
  args: { value: 850, showSign: true },
};

export const Zero: Story = {
  args: { value: 0, tone: "neutral" },
};

export const AllTones: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-2">
      <MoneyText
        value={5420.5}
        tone="positive"
        className="text-base font-semibold"
      />
      <MoneyText
        value={342.9}
        tone="negative"
        className="text-base font-semibold"
      />
      <MoneyText
        value={1200}
        tone="neutral"
        className="text-base font-semibold"
      />
    </div>
  ),
};
