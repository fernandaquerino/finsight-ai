import { Logo } from "@/components/app/Logo";
import { ThemeShowcase } from "@/components/app/ThemeShowcase";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { categoryColors, chartColors } from "@/styles/tokens";

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
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
            In development
          </p>
          <Logo className="h-10 w-auto text-foreground" />
        </div>
        <ThemeToggle />
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 space-y-4">
          <p className="inline-flex rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            AI-powered personal finance
          </p>
          <h2 className="max-w-2xl text-4xl leading-tight font-medium">
            Converse com seus dados financeiros com clareza e controle.
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Importe extratos, organize lancamentos e receba insights acionaveis
            com uma base visual consistente para dados sensiveis.
          </p>
          <div className="flex flex-wrap gap-2">
            {stackItems.map((item) => (
              <span
                key={item}
                className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <ThemeShowcase />

        <div className="mt-8">
          <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Chart sequence &amp; categories
          </p>
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-4 grid grid-cols-6 gap-2">
              {chartColors.map((color) => (
                <div
                  key={color}
                  className="h-10 rounded-md border"
                  style={{ backgroundColor: color }}
                  aria-label={`Chart color ${color}`}
                />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(categoryColors).map(([category, color]) => (
                <div
                  key={category}
                  className="flex items-center gap-3 rounded-md border bg-background px-3 py-2"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
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
      </section>
    </main>
  );
}
