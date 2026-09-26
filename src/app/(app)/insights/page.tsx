import {
  InsightsScreen,
  type SeverityFilter,
} from "@/features/insights/components/InsightsScreen";

export const metadata = {
  title: "Insights · FinSight AI",
  description:
    "Observações derivadas das suas transações, orçamentos e metas — com a fonte de cada número.",
};

type InsightsPageProps = Readonly<{
  searchParams: Promise<{ severity?: string }>;
}>;

// ?severity=risk|opportunity|attention|info. Inválido/ausente → todos.
function parseSeverity(value: string | undefined): SeverityFilter {
  return value === "risk" ||
    value === "opportunity" ||
    value === "attention" ||
    value === "info"
    ? value
    : "all";
}

export default async function InsightsPage({
  searchParams,
}: InsightsPageProps) {
  const { severity } = await searchParams;

  return <InsightsScreen initialSeverity={parseSeverity(severity)} />;
}
