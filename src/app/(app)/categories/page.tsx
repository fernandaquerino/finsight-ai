import {
  monthParamToString,
  parseMonthParam,
} from "@/features/dashboard/month";
import { CategoriesScreen } from "@/features/categories/components/CategoriesScreen";

type CategoriesPageProps = {
  searchParams: Promise<{ month?: string }>;
};

// ?month=YYYY-MM seleciona o mês; inválido/ausente → mês corrente.
export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const { month } = await searchParams;

  return (
    <CategoriesScreen
      initialMonth={monthParamToString(parseMonthParam(month))}
    />
  );
}
