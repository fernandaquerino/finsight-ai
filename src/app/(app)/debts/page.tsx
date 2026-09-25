import { DebtsScreen } from "@/features/debts/components/DebtsScreen";
import type { DebtStrategy } from "@/features/debts/types";

export const metadata = {
  title: "Dívidas · FinSight AI",
  description: "Acompanhe suas dívidas e quite com estratégia.",
};

type DebtsPageProps = Readonly<{
  searchParams: Promise<{ strategy?: string }>;
}>;

// ?strategy=avalanche|snowball seleciona a estratégia; inválido/ausente →
// avalanche (a que custa menos juros).
function parseStrategy(value: string | undefined): DebtStrategy {
  return value === "snowball" ? "snowball" : "avalanche";
}

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const { strategy } = await searchParams;

  return <DebtsScreen initialStrategy={parseStrategy(strategy)} />;
}
