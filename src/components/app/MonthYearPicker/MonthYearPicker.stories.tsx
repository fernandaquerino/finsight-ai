/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { MonthYearPicker } from "./MonthYearPicker";

const meta = {
  title: "App/MonthYearPicker",
  component: MonthYearPicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    value: new Date(2025, 4, 1),
    onChange: () => {},
  },
} satisfies Meta<typeof MonthYearPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: () => {
    const [date, setDate] = useState(new Date(2025, 4, 1));
    return (
      <div className="flex flex-col items-center gap-4">
        <MonthYearPicker value={date} onChange={setDate} />
        <p className="text-sm text-muted-foreground">
          Selecionado:{" "}
          {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </div>
    );
  },
};
