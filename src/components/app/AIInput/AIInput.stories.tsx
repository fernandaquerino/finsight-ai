"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { AIInput } from "./AIInput";

const meta = {
  title: "App/AI/AIInput",
  component: AIInput,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    value: "",
    onChange: () => {},
    onSubmit: () => {},
  },
  argTypes: {
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    showDisclaimer: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof AIInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledInput(props: Partial<React.ComponentProps<typeof AIInput>>) {
  const [value, setValue] = useState("");
  return (
    <div className="w-[500px]">
      <AIInput
        value={value}
        onChange={setValue}
        onSubmit={(v) => {
          alert(`Enviado: "${v}"`);
          setValue("");
        }}
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledInput />,
};

export const Loading: Story = {
  render: () => <ControlledInput loading />,
};

export const Disabled: Story = {
  render: () => <ControlledInput disabled />,
};

export const WithoutDisclaimer: Story = {
  render: () => <ControlledInput showDisclaimer={false} />,
};
