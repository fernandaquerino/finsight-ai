import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataRow } from "@/components/app/DataRow";
import { DataList } from "./DataList";

const items = [
  { id: "1", title: "Primeiro" },
  { id: "2", title: "Segundo" },
] as const;
type Item = { id: string; title: string };
const emptyItems: readonly Item[] = [];

describe("DataList", () => {
  it("renders list items", () => {
    render(
      <DataList
        ariaLabel="Itens"
        items={items}
        getKey={(item) => item.id}
        renderItem={(item) => <DataRow title={item.title} />}
      />,
    );

    expect(screen.getByRole("list", { name: "Itens" })).toBeInTheDocument();
    expect(screen.getByText("Primeiro")).toBeInTheDocument();
    expect(screen.getByText("Segundo")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    const { container } = render(
      <DataList
        ariaLabel="Itens"
        items={emptyItems}
        getKey={(item) => item.id}
        renderItem={(item) => <DataRow title={item.title} />}
        isLoading
        loadingCount={2}
      />,
    );

    expect(screen.getByRole("list", { name: "Itens" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(container.querySelectorAll("[data-slot='skeleton']")).toHaveLength(
      8,
    );
  });

  it("renders empty state", () => {
    render(
      <DataList
        ariaLabel="Itens"
        items={emptyItems}
        getKey={(item) => item.id}
        renderItem={(item) => <DataRow title={item.title} />}
        emptyTitle="Nenhum item"
      />,
    );

    expect(screen.getByText("Nenhum item")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <DataList
        ariaLabel="Itens"
        items={emptyItems}
        getKey={(item) => item.id}
        renderItem={(item) => <DataRow title={item.title} />}
        error="Tente novamente."
      />,
    );

    expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente.")).toBeInTheDocument();
  });
});
