import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "metric", "ai"],
    },
    padding: {
      control: "select",
      options: ["default", "sm", "none"],
    },
    interactive: { control: "boolean" },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader>
        <CardEyebrow>RECEITA DO MÊS</CardEyebrow>
      </CardHeader>
      <CardContent>
        <CardTitle>Saldo atual</CardTitle>
        <CardDescription>
          Últimos 30 dias de movimentação financeira.
        </CardDescription>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">Atualizado agora</span>
      </CardFooter>
    </Card>
  ),
};

export const AIVariant: Story = {
  render: () => (
    <Card variant="ai" className="w-96">
      <CardHeader>
        <CardEyebrow className="text-primary">ANÁLISE DA IA</CardEyebrow>
      </CardHeader>
      <CardContent>
        <CardTitle>Gasto com alimentação elevado</CardTitle>
        <CardDescription>
          Seu gasto ficou 17% acima da média dos últimos 6 meses.
        </CardDescription>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive className="w-72 cursor-pointer">
      <CardContent>
        <CardTitle>Cartão interativo</CardTitle>
        <CardDescription>Clique para navegar ou expandir.</CardDescription>
      </CardContent>
    </Card>
  ),
};

export const SmallPadding: Story = {
  render: () => (
    <Card padding="sm" className="w-64">
      <CardContent>
        <CardTitle>Compacto</CardTitle>
        <CardDescription>Padding reduzido para listas densas.</CardDescription>
      </CardContent>
    </Card>
  ),
};
