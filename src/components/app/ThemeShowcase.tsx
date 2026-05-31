const semanticColors = [
  { label: "primary", bg: "bg-primary", fg: "text-primary-foreground" },
  { label: "secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
  { label: "muted", bg: "bg-muted", fg: "text-muted-foreground" },
  { label: "accent", bg: "bg-accent", fg: "text-accent-foreground" },
  {
    label: "destructive",
    bg: "bg-destructive",
    fg: "text-destructive-foreground",
  },
  { label: "success", bg: "bg-success", fg: "text-success-foreground" },
  { label: "warning", bg: "bg-warning", fg: "text-warning-foreground" },
  { label: "info", bg: "bg-info", fg: "text-info-foreground" },
] as const;

const typographyScale = [
  { label: "micro", cls: "text-micro" },
  { label: "xs", cls: "text-xs" },
  { label: "sm", cls: "text-sm" },
  { label: "base", cls: "text-base" },
  { label: "md", cls: "text-md" },
  { label: "lg", cls: "text-lg" },
  { label: "xl", cls: "text-xl" },
  { label: "metric", cls: "text-metric" },
] as const;

const financialValues = [
  { label: "Saldo atual", value: "R$ 12.847,53", positive: true },
  { label: "Despesas", value: "R$ 3.291,00", positive: false },
  { label: "Receitas", value: "R$ 16.138,53", positive: true },
] as const;

const radii = [
  { label: "xs", cls: "rounded-xs" },
  { label: "sm", cls: "rounded-sm" },
  { label: "md", cls: "rounded-md" },
  { label: "lg", cls: "rounded-lg" },
  { label: "xl", cls: "rounded-xl" },
] as const;

export function ThemeShowcase() {
  return (
    <div className="space-y-10 rounded-xl border bg-background p-6 text-foreground">
      <div>
        <h2 className="mb-1 text-md font-medium">
          Design System — FinSight AI
        </h2>
        <p className="text-sm text-muted-foreground">
          Tokens semânticos, tipografia e utilitários financeiros.
        </p>
      </div>

      {/* Semantic color palette */}
      <section aria-labelledby="colors-heading">
        <h3
          id="colors-heading"
          className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Semantic colors
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {semanticColors.map(({ label, bg, fg }) => (
            <div
              key={label}
              className={`${bg} ${fg} flex h-14 items-center justify-center rounded-md text-xs font-medium`}
              aria-label={`Color: ${label}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="flex h-10 items-center justify-center rounded-md border bg-card text-xs font-medium text-card-foreground">
            card
          </div>
          <div className="flex h-10 items-center justify-center rounded-md border bg-popover text-xs font-medium text-popover-foreground">
            popover
          </div>
          <div className="flex h-10 items-center justify-center rounded-md border bg-background text-xs font-medium text-foreground">
            background
          </div>
        </div>
      </section>

      {/* Typography scale */}
      <section aria-labelledby="typography-heading">
        <h3
          id="typography-heading"
          className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Typography scale
        </h3>
        <div className="space-y-2">
          {typographyScale.map(({ label, cls }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="w-12 shrink-0 text-xs text-muted-foreground tabular-nums">
                {label}
              </span>
              <span className={cls}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </section>

      {/* Financial values with tabular-nums */}
      <section aria-labelledby="financial-heading">
        <h3
          id="financial-heading"
          className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Financial values (tabular-nums)
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {financialValues.map(({ label, value, positive }) => (
            <div key={label} className="rounded-md border bg-card p-3">
              <p className="mb-1 text-xs text-muted-foreground">{label}</p>
              <p
                className={`text-metric font-medium tabular-nums ${
                  positive ? "text-success" : "text-destructive"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Dígitos alinhados: o layout não oscila quando os números mudam.
        </p>
      </section>

      {/* Border radius */}
      <section aria-labelledby="radius-heading">
        <h3
          id="radius-heading"
          className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Border radius
        </h3>
        <div className="flex flex-wrap gap-3">
          {radii.map(({ label, cls }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`${cls} size-12 border-2 border-primary/40 bg-primary/20`}
                aria-label={`Radius: ${label}`}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Motion tokens */}
      <section aria-labelledby="motion-heading">
        <h3
          id="motion-heading"
          className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
        >
          Motion
        </h3>
        <div className="flex flex-wrap gap-3">
          {(["fast", "normal", "slow"] as const).map((speed) => (
            <div
              key={speed}
              className="group cursor-default rounded-md border bg-card px-3 py-2 text-xs transition-colors"
              style={{
                transitionDuration: `var(--motion-${speed})`,
                transitionTimingFunction: "var(--ease-standard)",
              }}
            >
              <span className="text-muted-foreground">{speed}</span>
              <span className="ml-1 text-foreground">
                {speed === "fast"
                  ? "120ms"
                  : speed === "normal"
                    ? "180ms"
                    : "240ms"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
