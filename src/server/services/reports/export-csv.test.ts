import { describe, expect, it } from "vitest";

import {
  buildReportCsv,
  escapeCsvField,
  reportFileName,
  type ExportRow,
} from "./export-csv";

function row(overrides: Partial<ExportRow> = {}): ExportRow {
  return {
    occurredAt: new Date(2026, 4, 30),
    description: "Supermercado",
    amount: "312.74",
    currency: "BRL",
    kind: "expense",
    origin: "import",
    categoryName: "Alimentação",
    accountName: "Itaú · Corrente",
    ...overrides,
  };
}

describe("escapeCsvField", () => {
  it("quotes fields containing a separator, quote or newline", () => {
    expect(escapeCsvField("Mercado, feira")).toBe('"Mercado, feira"');
    expect(escapeCsvField('Aspas "duplas"')).toBe('"Aspas ""duplas"""');
    expect(escapeCsvField("linha\nnova")).toBe('"linha\nnova"');
  });

  it("neutralizes formula injection", () => {
    expect(escapeCsvField("=SOMA(A1:A2)")).toBe("'=SOMA(A1:A2)");
    expect(escapeCsvField("+55 11")).toBe("'+55 11");
    expect(escapeCsvField("@import")).toBe("'@import");
    // Guarda e aspas se aplicam juntas quando o campo também tem separador.
    expect(escapeCsvField("-28,50")).toBe('"\'-28,50"');
  });

  it("leaves a plain field untouched", () => {
    expect(escapeCsvField("Alimentação")).toBe("Alimentação");
  });
});

describe("buildReportCsv", () => {
  it("writes a BOM, the header and one CRLF line per transaction", () => {
    const csv = buildReportCsv([row()]);
    const lines = csv.split("\r\n");

    expect(csv.startsWith("﻿")).toBe(true);
    expect(lines[0]).toBe(
      "﻿data,descricao,categoria,conta,tipo,origem,valor,moeda",
    );
    expect(lines[1]).toBe(
      "2026-05-30,Supermercado,Alimentação,Itaú · Corrente,despesa,extrato,312.74,BRL",
    );
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("uses a dot as the decimal separator", () => {
    expect(buildReportCsv([row({ amount: "1842.3" })])).toContain("1842.30");
  });

  it("keeps empty cells for missing category, account and description", () => {
    const csv = buildReportCsv([
      row({ description: null, categoryName: null, accountName: null }),
    ]);

    expect(csv.split("\r\n")[1]).toBe(
      "2026-05-30,,,,despesa,extrato,312.74,BRL",
    );
  });

  it("translates kind and origin to pt-BR labels", () => {
    const csv = buildReportCsv([
      row({ kind: "income", origin: "manual" }),
      row({ kind: "transfer", origin: "recurring" }),
    ]);

    expect(csv).toContain("receita,manual");
    expect(csv).toContain("transferencia,recorrente");
  });

  it("returns only the header without transactions", () => {
    expect(buildReportCsv([])).toBe(
      "﻿data,descricao,categoria,conta,tipo,origem,valor,moeda\r\n",
    );
  });
});

describe("reportFileName", () => {
  it("builds a safe file name per period key", () => {
    expect(reportFileName("2026-05", "csv")).toBe(
      "finsight-relatorio-2026-05.csv",
    );
    expect(reportFileName("2026-Q2", "pdf")).toBe(
      "finsight-relatorio-2026-q2.pdf",
    );
  });

  it("strips path separators from the key", () => {
    expect(reportFileName("../../etc/passwd", "csv")).toBe(
      "finsight-relatorio-------etc-passwd.csv",
    );
  });
});
