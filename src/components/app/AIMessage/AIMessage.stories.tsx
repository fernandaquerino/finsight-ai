import type { Meta, StoryObj } from "@storybook/react";

import { AIMessage } from "./AIMessage";

const meta = {
  title: "App/AI/AIMessage",
  component: AIMessage,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    variant: "user",
    children: "Exemplo de mensagem.",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["user", "assistant", "system"],
    },
  },
} satisfies Meta<typeof AIMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {
  args: {
    variant: "user",
    children: "Onde gastei mais este mês?",
  },
};

export const Assistant: Story = {
  args: {
    variant: "assistant",
    children:
      "Seu maior gasto em maio foi Alimentação, com R$ 1.842 — 17% acima da sua média dos últimos 6 meses (R$ 1.574).",
  },
};

export const System: Story = {
  args: {
    variant: "system",
    children:
      "Conversa iniciada. Posso responder perguntas sobre seus dados financeiros.",
  },
};

export const Conversation: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-[480px] flex-col gap-4">
      <AIMessage variant="system">
        Conversa iniciada. Posso responder perguntas sobre seus dados.
      </AIMessage>
      <AIMessage variant="user">Onde gastei mais este mês?</AIMessage>
      <AIMessage variant="assistant">
        Seu maior gasto em maio foi <strong>Alimentação</strong>, com R$ 1.842 —
        17% acima da sua média dos últimos 6 meses (R$ 1.574).
      </AIMessage>
      <AIMessage variant="user">Quais assinaturas posso revisar?</AIMessage>
    </div>
  ),
};
