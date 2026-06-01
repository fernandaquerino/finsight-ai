// Chart colors are resolved HSL values — Recharts uses inline SVG styles and
// cannot read CSS custom properties at render time. Keep in sync with globals.css.
export const CHART_COLORS = {
  // Mirrors --primary (light) / --primary (dark)
  primary:     "hsl(248, 53%, 50%)",
  primarySoft: "hsl(248, 70%, 96%)",
  // Mirrors --success
  success:     "hsl(162, 70%, 30%)",
  // Mirrors --danger
  danger:      "hsl(0, 68%, 47%)",
  // Grid / axis — mirrors --border (light)
  grid:        "hsl(240, 6%, 90%)",
  // Axis label — mirrors --muted-foreground (light)
  axisLabel:   "hsl(240, 4%, 46%)",
  // Spending categories — derived from prototype
  category: {
    moradia:     "#4845C8",
    alimentacao: "#20A077",
    transporte:  "#D95B4A",
    lazer:       "#E88080",
    saude:       "#4592D0",
    outro:       "#94A3B8",
  },
} as const;
