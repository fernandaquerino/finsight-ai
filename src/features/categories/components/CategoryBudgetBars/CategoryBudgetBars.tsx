import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CategoryBudgetBarItem = Readonly<{
  id: string;
  name: string;
  color: string;
  amount: number;
  budget: number;
}>;

type CategoryBudgetBarsProps = Readonly<{
  items: readonly CategoryBudgetBarItem[];
  className?: string;
}>;

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

// Barras horizontais de gasto vs orçamento por categoria. Os dados chegam
// prontos (sem regra de negócio aqui). A barra é decorativa: a mesma informação
// está no texto de cada linha e numa tabela para leitores de tela.
function CategoryBudgetBars({ items, className }: CategoryBudgetBarsProps) {
  return (
    <figure className={cn("m-0", className)}>
      <ul className="space-y-3.5" aria-hidden="true">
        {items.map((item) => {
          const ratio = item.budget > 0 ? item.amount / item.budget : 0;
          const isOver = ratio > 1;
          // Acima do orçamento a barra enche por completo; a cor de perigo no
          // valor e na barra é o que sinaliza o estouro.
          const fillWidth = Math.min(ratio, 1) * 100;

          return (
            <li key={item.id}>
              <div className="mb-[5px] flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                  {item.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs tabular-nums",
                    isOver ? "text-danger" : "text-muted-foreground",
                  )}
                >
                  {formatMoney(item.amount)}
                  <span className="opacity-60">
                    {" "}
                    / {formatMoney(item.budget)}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-[inherit] transition-[width] duration-500 ease-out"
                  style={{
                    width: `${fillWidth}%`,
                    backgroundColor: isOver ? "hsl(var(--danger))" : item.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <table className="sr-only">
        <caption>Gasto do mês em relação ao orçamento por categoria</caption>
        <thead>
          <tr>
            <th scope="col">Categoria</th>
            <th scope="col">Gasto</th>
            <th scope="col">Orçamento</th>
            <th scope="col">Uso</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item.name}</th>
              <td>{formatMoney(item.amount)}</td>
              <td>{formatMoney(item.budget)}</td>
              <td>
                {formatPercent(item.budget > 0 ? item.amount / item.budget : 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export { CategoryBudgetBars };
