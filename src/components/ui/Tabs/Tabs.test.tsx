import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

describe("Tabs", () => {
  it("renders tabs composition with default value", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Resumo financeiro</TabsContent>
        <TabsContent value="details">Transações detalhadas</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-slot",
      "tabs-list",
    );
    expect(screen.getByRole("tab", { name: "Visão geral" })).toHaveAttribute(
      "data-slot",
      "tabs-trigger",
    );
    expect(screen.getByRole("tab", { name: "Visão geral" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByText("Resumo financeiro")).toHaveAttribute(
      "data-slot",
      "tabs-content",
    );
  });

  it("uses default styles and supports custom className", () => {
    render(
      <Tabs defaultValue="overview" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="overview" className="custom-trigger">
            Visão geral
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="custom-content">
          Resumo financeiro
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Resumo financeiro").parentElement).toHaveClass(
      "custom-tabs",
    );
    expect(screen.getByRole("tablist")).toHaveClass("h-10", "custom-list");
    expect(screen.getByRole("tab", { name: "Visão geral" })).toHaveClass(
      "focus-visible:ring-2",
      "custom-trigger",
    );
    expect(screen.getByText("Resumo financeiro")).toHaveClass(
      "focus-visible:ring-2",
      "custom-content",
    );
  });

  it("changes tab with user interaction", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="overview" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Resumo financeiro</TabsContent>
        <TabsContent value="details">Transações detalhadas</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole("tab", { name: "Detalhes" }));

    expect(onValueChange).toHaveBeenCalledWith("details");
    expect(screen.getByRole("tab", { name: "Detalhes" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByText("Transações detalhadas")).toBeVisible();
  });

  it("supports disabled triggers", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="overview" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="details" disabled>
            Detalhes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Resumo financeiro</TabsContent>
        <TabsContent value="details">Transações detalhadas</TabsContent>
      </Tabs>,
    );

    const disabledTab = screen.getByRole("tab", { name: "Detalhes" });

    expect(disabledTab).toBeDisabled();

    await user.click(disabledTab);

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
