import type { Meta, StoryObj } from "@storybook/react";

import { TrendIndicator } from "./TrendIndicator";

const meta = {
  title: "App/TrendIndicator",
  component: TrendIndicator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { value: 0 },
  argTypes: {
    value: { control: "number" },
    suffix: { control: "text" },
  },
} satisfies Meta<typeof TrendIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: { value: 12.5 },
};

export const Negative: Story = {
  args: { value: -8.3 },
};

export const Neutral: Story = {
  args: { value: 0 },
};

export const WithSuffix: Story = {
  args: { value: 17, suffix: "vs. mês anterior" },
};

export const AllDirections: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-3">
      <TrendIndicator value={12.5} suffix="vs. mês anterior" />
      <TrendIndicator value={-8.3} suffix="vs. mês anterior" />
      <TrendIndicator value={0} suffix="sem variação" />
    </div>
  ),
};
