import type { Meta, StoryObj } from "@storybook/react";

import { ChartCardSkeleton } from "./ChartCardSkeleton";
import { MetricCardSkeleton } from "./MetricCardSkeleton";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { TransactionListSkeleton } from "./TransactionListSkeleton";

const meta = {
  title: "App/Skeletons",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MetricCard: Story = {
  render: () => (
    <div className="w-64">
      <MetricCardSkeleton />
    </div>
  ),
};

export const MetricCardGrid: Story = {
  render: () => (
    <div className="grid w-[600px] grid-cols-2 gap-4">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  ),
};

export const ChartCard: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartCardSkeleton />
    </div>
  ),
};

export const TransactionList: Story = {
  render: () => (
    <div className="w-[400px]">
      <TransactionListSkeleton />
    </div>
  ),
};

export const TransactionListShort: Story = {
  render: () => (
    <div className="w-[400px]">
      <TransactionListSkeleton count={3} />
    </div>
  ),
};

export const Notifications: Story = {
  render: () => (
    <div className="w-[448px] overflow-hidden rounded-lg border">
      <NotificationSkeleton />
    </div>
  ),
};

export const Sidebar: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <SidebarSkeleton />,
};

export const DashboardLayout: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="w-[900px] space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartCardSkeleton />
        </div>
        <div>
          <ChartCardSkeleton />
        </div>
      </div>
      <div className="w-full rounded-lg border p-4">
        <TransactionListSkeleton count={6} />
      </div>
    </div>
  ),
};
