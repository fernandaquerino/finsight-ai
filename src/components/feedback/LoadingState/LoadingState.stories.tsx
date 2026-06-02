import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingState } from "./LoadingState";

const meta = {
  title: "Feedback/LoadingState",
  component: LoadingState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    label: { control: "text" },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: "w-80" },
};

export const CustomLabel: Story = {
  args: { label: "Carregando transações", className: "w-80" },
};

export const CustomSkeleton: Story = {
  render: () => (
    <LoadingState label="Carregando gráfico" className="w-80">
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </LoadingState>
  ),
};
