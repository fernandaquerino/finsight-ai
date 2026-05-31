import { ThemeToggle } from "@/components/app/theme-toggle";
import { chartColors, categoryColors } from "@/styles/tokens";

const stackItems = [
  "Next.js App Router",
  "TypeScript strict",
  "PostgreSQL + pgvector",
  "Redis",
  "Vercel AI SDK",
] as const;

const categoryLabels = {
  alimentacao: "Alimentacao",
  moradia: "Moradia",
  transporte: "Transporte",
  assinaturas: "Assinaturas",
  saude: "Saude",
  lazer: "Lazer",
  outros: "Outros",
} as const;

export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.06em] uppercase">
            In development
          </p>
          <h1 className="text-xl font-medium">FinSight AI</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="bg-accent text-accent-foreground inline-flex rounded-md px-3 py-1 text-xs font-medium">
              AI-powered personal finance
            </p>
            <h2 className="max-w-2xl text-4xl leading-tight font-medium">
              Converse com seus dados financeiros com clareza e controle.
            </h2>
            <p className="text-muted-foreground max-w-xl text-base">
              Importe extratos, organize lancamentos e receba insights
              acionaveis com uma base visual consistente para dados sensiveis.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stackItems.map((item) => (
              <span
                key={item}
                className="bg-card text-muted-foreground rounded-md border px-3 py-1.5 text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-md font-medium">Design tokens</h3>
              <p className="text-muted-foreground text-sm">
                Cores semanticas, graficos e categorias financeiras.
              </p>
            </div>
            <span className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium">
              IA
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Chart sequence
              </p>
              <div className="grid grid-cols-6 gap-2">
                {chartColors.map((color) => (
                  <div
                    key={color}
                    className="h-12 rounded-md border"
                    style={{ backgroundColor: color }}
                    aria-label={`Chart color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Financial categories
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(categoryColors).map(([category, color]) => (
                  <div
                    key={category}
                    className="bg-background flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
