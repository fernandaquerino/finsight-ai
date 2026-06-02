import type { Meta, StoryObj } from "@storybook/react";

import { InlineFeedback } from "./InlineFeedback";

const meta = {
  title: "Feedback/InlineFeedback",
  component: InlineFeedback,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { message: "Mensagem de feedback." },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "error", "info"],
    },
    message: { control: "text" },
  },
} satisfies Meta<typeof InlineFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { variant: "success", message: "Transação salva com sucesso." },
};

export const Warning: Story = {
  args: { variant: "warning", message: "Transação duplicada detectada." },
};

export const Error: Story = {
  args: {
    variant: "error",
    message: "Informe um valor válido maior que zero.",
  },
};

export const Info: Story = {
  args: { variant: "info", message: "Esta ação não pode ser desfeita." },
};

export const AllVariants: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <InlineFeedback
        variant="success"
        message="Transação salva com sucesso."
      />
      <InlineFeedback
        variant="warning"
        message="Possível duplicata identificada."
      />
      <InlineFeedback variant="error" message="Informe um valor válido." />
      <InlineFeedback
        variant="info"
        message="Esta ação não pode ser desfeita."
      />
    </div>
  ),
};
