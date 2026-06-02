/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { CategoryLegend } from "./CategoryLegend";
import type { CategoryLegendItem } from "./CategoryLegend";

const SAMPLE_DATA: readonly CategoryLegendItem[] = [
  { category: "moradia", value: 1850, percentage: 38 },
  { category: "alimentacao", value: 980, percentage: 20 },
  { category: "transporte", value: 640, percentage: 13 },
  { category: "lazer", value: 490, percentage: 10 },
  { category: "saude", value: 380, percentage: 8 },
  { category: "outros", value: 520, percentage: 11 },
];

const meta = {
  title: "App/Dashboard/CategoryLegend",
  component: CategoryLegend,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { data: SAMPLE_DATA },
} satisfies Meta<typeof CategoryLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveIndex: Story = {
  args: {
    data: SAMPLE_DATA,
    activeIndex: 1,
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
      undefined,
    );
    return (
      <div className="w-56">
        <CategoryLegend
          data={SAMPLE_DATA}
          activeIndex={activeIndex}
          onHoverIndex={setActiveIndex}
        />
      </div>
    );
  },
};
