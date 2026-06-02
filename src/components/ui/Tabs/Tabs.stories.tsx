import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="transactions">Transações</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          Conteúdo da visão geral.
        </p>
      </TabsContent>
      <TabsContent value="transactions">
        <p className="text-sm text-muted-foreground">
          Lista de transações aqui.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground">Relatórios e gráficos.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="income" className="w-72">
      <TabsList>
        <TabsTrigger value="income">Receitas</TabsTrigger>
        <TabsTrigger value="expenses">Despesas</TabsTrigger>
      </TabsList>
      <TabsContent value="income">
        <p className="text-sm text-muted-foreground">Receitas do período.</p>
      </TabsContent>
      <TabsContent value="expenses">
        <p className="text-sm text-muted-foreground">Despesas do período.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="transactions">Transações</TabsTrigger>
        <TabsTrigger value="reports" disabled>
          Relatórios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">Aba ativa.</p>
      </TabsContent>
      <TabsContent value="transactions">
        <p className="text-sm text-muted-foreground">Transações.</p>
      </TabsContent>
    </Tabs>
  ),
};
