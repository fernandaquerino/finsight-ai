// Geração do CSV de exportação. Função pura: recebe as linhas já lidas do banco
// e devolve o texto. Nenhum dado de outro usuário chega aqui — o repository
// filtra por userId antes.

export type ExportRow = Readonly<{
  occurredAt: Date;
  description: string | null;
  amount: string;
  currency: string;
  kind: "income" | "expense" | "transfer";
  origin: "manual" | "import" | "recurring" | "integration";
  categoryName: string | null;
  accountName: string | null;
}>;

const CSV_HEADERS = [
  "data",
  "descricao",
  "categoria",
  "conta",
  "tipo",
  "origem",
  "valor",
  "moeda",
] as const;

const kindLabels = {
  income: "receita",
  expense: "despesa",
  transfer: "transferencia",
} as const;

const originLabels = {
  manual: "manual",
  import: "extrato",
  recurring: "recorrente",
  integration: "integracao",
} as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Escapa o campo conforme RFC 4180 e neutraliza fórmulas: um campo iniciado por
// = + - @ é executado ao abrir o CSV no Excel/Sheets (CSV injection). Prefixar
// com apóstrofo mantém o texto legível e inerte.
export function escapeCsvField(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return /[",\n\r]/.test(guarded)
    ? `"${guarded.replace(/"/g, '""')}"`
    : guarded;
}

export function buildReportCsv(rows: readonly ExportRow[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const row of rows) {
    lines.push(
      [
        toDateKey(new Date(row.occurredAt)),
        row.description?.trim() ?? "",
        row.categoryName ?? "",
        row.accountName ?? "",
        kindLabels[row.kind],
        originLabels[row.origin],
        // Ponto decimal: o formato canônico de CSV, não o separador local.
        Number(row.amount).toFixed(2),
        row.currency,
      ]
        .map((field) => escapeCsvField(String(field)))
        .join(","),
    );
  }

  // CRLF + BOM: o Excel em pt-BR só reconhece o UTF-8 do arquivo com BOM.
  return `﻿${lines.join("\r\n")}\r\n`;
}

// Nome de arquivo determinístico e seguro (sem separador de caminho).
export function reportFileName(periodKey: string, extension: string): string {
  const safeKey = periodKey.replace(/[^A-Za-z0-9-]/g, "-").toLowerCase();

  return `finsight-relatorio-${safeKey}.${extension}`;
}
