import { createElement as h } from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { ReportSummary } from "./build-report";

// Geração do PDF do relatório.
//
// Roda SOMENTE no servidor (route handler com runtime "nodejs"): @react-pdf/
// renderer é uma dependência pesada e não entra no bundle do cliente. O
// documento usa as fontes padrão do PDF (Helvetica) — nada é buscado na rede.
//
// Nenhum valor é inventado aqui: todo número vem do ReportSummary já calculado.

const palette = {
  text: "#1C1B1A",
  muted: "#6B6A66",
  border: "#E5E4E1",
  primary: "#534AB7",
  success: "#1D9E75",
  danger: "#C0392B",
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: palette.text,
  },
  brand: { fontSize: 9, color: palette.primary, letterSpacing: 1 },
  title: { fontSize: 20, marginTop: 6, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, color: palette.muted, marginTop: 3 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  section: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 14,
  },
  metricsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 4,
    padding: 10,
  },
  metricLabel: { fontSize: 8, color: palette.muted, letterSpacing: 0.6 },
  metricValue: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 4 },
  metricDelta: { fontSize: 8, marginTop: 3 },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  headerRow: { flexDirection: "row", paddingBottom: 5 },
  headerCell: { fontSize: 8, color: palette.muted, letterSpacing: 0.6 },
  cellName: { flex: 1 },
  cellNumber: { width: 90, textAlign: "right" },
  cellShare: { width: 52, textAlign: "right" },
  highlight: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 4,
    padding: 12,
  },
  highlightLabel: { fontSize: 8, color: palette.primary, letterSpacing: 0.8 },
  highlightTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  body: { fontSize: 10, lineHeight: 1.5, marginTop: 4 },
  source: { fontSize: 8, color: palette.muted, marginTop: 6 },
  empty: { fontSize: 10, color: palette.muted },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: palette.muted,
    textAlign: "center",
  },
});

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDelta(delta: number | null): string | null {
  if (delta === null) return null;

  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs. período anterior`;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function Metric({
  label,
  value,
  delta,
  deltaTone,
}: Readonly<{
  label: string;
  value: string;
  delta?: string | null;
  deltaTone?: "success" | "danger";
}>) {
  return h(
    View,
    { style: styles.metricCard },
    h(Text, { style: styles.metricLabel }, label.toUpperCase()),
    h(Text, { style: styles.metricValue }, value),
    delta
      ? h(
          Text,
          {
            style: [
              styles.metricDelta,
              {
                color:
                  deltaTone === "danger" ? palette.danger : palette.success,
              },
            ],
          },
          delta,
        )
      : null,
  );
}

// Retorna o elemento <Document> diretamente (em vez de um componente que o
// envolve): renderToBuffer tipa o argumento como ReactElement<DocumentProps>,
// e um wrapper com props próprias não satisfaz esse tipo.
function reportDocumentElement(report: ReportSummary, generatedAt: Date) {
  const { period } = report;

  return h(
    Document,
    {
      title: `FinSight AI — Relatório de ${period.label}`,
      author: "FinSight AI",
      creator: "FinSight AI",
    },
    h(
      Page,
      { size: "A4", style: styles.page },

      h(Text, { style: styles.brand }, "FINSIGHT AI"),
      h(Text, { style: styles.title }, `Relatório de ${period.label}`),
      h(
        Text,
        { style: styles.subtitle },
        `Período de ${formatDate(period.from)} a ${formatDate(period.to)} · ${report.transactionCount} ${report.transactionCount === 1 ? "transação" : "transações"}`,
      ),

      h(
        View,
        { style: styles.metricsRow },
        h(Metric, {
          label: "Entradas",
          value: formatBRL(report.income.value),
          delta: formatDelta(report.income.deltaPercentage),
          deltaTone:
            (report.income.deltaPercentage ?? 0) >= 0 ? "success" : "danger",
        }),
        h(Metric, {
          label: "Saídas",
          value: formatBRL(report.expenses.value),
          delta: formatDelta(report.expenses.deltaPercentage),
          // Despesa subindo é o sinal ruim — a cor é invertida de propósito.
          deltaTone:
            (report.expenses.deltaPercentage ?? 0) > 0 ? "danger" : "success",
        }),
        h(Metric, {
          label: "Resultado",
          value: formatBRL(report.balance),
          delta:
            report.savingsRate === null
              ? null
              : `${Math.round(report.savingsRate * 100)}% das entradas`,
          deltaTone: report.balance >= 0 ? "success" : "danger",
        }),
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.sectionTitle }, "Composição das despesas"),
        report.expenseComposition.length === 0
          ? h(
              Text,
              { style: styles.empty },
              "Nenhuma despesa categorizada no período.",
            )
          : h(
              View,
              null,
              h(
                View,
                { style: styles.headerRow },
                h(
                  Text,
                  { style: [styles.headerCell, styles.cellName] },
                  "CATEGORIA",
                ),
                h(
                  Text,
                  { style: [styles.headerCell, styles.cellNumber] },
                  "VALOR",
                ),
                h(Text, { style: [styles.headerCell, styles.cellShare] }, "%"),
              ),
              ...report.expenseComposition.map((slice) =>
                h(
                  View,
                  { key: slice.id, style: styles.row },
                  h(Text, { style: styles.cellName }, slice.name),
                  h(Text, { style: styles.cellNumber }, formatBRL(slice.value)),
                  h(Text, { style: styles.cellShare }, `${slice.percentage}%`),
                ),
              ),
            ),
      ),

      report.budgetUsage.length > 0
        ? h(
            View,
            { style: styles.section },
            h(
              Text,
              { style: styles.sectionTitle },
              period.monthCount === 1
                ? "Orçamento por categoria"
                : `Orçamento por categoria (limite mensal × ${period.monthCount} meses)`,
            ),
            h(
              View,
              { style: styles.headerRow },
              h(
                Text,
                { style: [styles.headerCell, styles.cellName] },
                "CATEGORIA",
              ),
              h(
                Text,
                { style: [styles.headerCell, styles.cellNumber] },
                "GASTO",
              ),
              h(
                Text,
                { style: [styles.headerCell, styles.cellNumber] },
                "LIMITE",
              ),
              h(Text, { style: [styles.headerCell, styles.cellShare] }, "USO"),
            ),
            ...report.budgetUsage.map((item) => {
              const usage = item.budget > 0 ? item.amount / item.budget : 0;
              return h(
                View,
                { key: item.id, style: styles.row },
                h(Text, { style: styles.cellName }, item.name),
                h(Text, { style: styles.cellNumber }, formatBRL(item.amount)),
                h(Text, { style: styles.cellNumber }, formatBRL(item.budget)),
                h(
                  Text,
                  {
                    style: [
                      styles.cellShare,
                      usage > 1 ? { color: palette.danger } : {},
                    ],
                  },
                  `${Math.round(usage * 100)}%`,
                ),
              );
            }),
          )
        : null,

      h(
        View,
        { style: styles.highlight },
        h(Text, { style: styles.highlightLabel }, "RESUMO DO PERÍODO"),
        h(Text, { style: styles.highlightTitle }, report.highlight.title),
        h(Text, { style: styles.body }, report.highlight.description),
        h(Text, { style: styles.source }, report.highlight.source),
      ),

      h(
        Text,
        { style: styles.footer, fixed: true },
        `Gerado pelo FinSight AI em ${generatedAt.toLocaleString("pt-BR")} · estimativas com base nos seus próprios dados, não aconselhamento financeiro profissional.`,
      ),
    ),
  );
}

export async function renderReportPdf(
  report: ReportSummary,
  generatedAt: Date = new Date(),
): Promise<Buffer> {
  return renderToBuffer(reportDocumentElement(report, generatedAt));
}
