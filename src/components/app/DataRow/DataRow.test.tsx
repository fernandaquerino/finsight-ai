import { render, screen } from "@testing-library/react";
import { WalletIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TransactionAmount } from "@/components/app/TransactionAmount";
import { DataRow } from "./DataRow";

describe("DataRow", () => {
  it("renders icon, title, description, and value", () => {
    render(
      <ul>
        <DataRow
          icon={WalletIcon}
          title="Padaria São Jorge"
          description="31 mai · Extrato"
          value={<TransactionAmount value={-28.5} />}
        />
      </ul>,
    );

    expect(screen.getByText("Padaria São Jorge")).toBeInTheDocument();
    expect(screen.getByText("31 mai · Extrato")).toBeInTheDocument();
    expect(screen.getByText("-R$ 28,50")).toBeInTheDocument();
  });
});
