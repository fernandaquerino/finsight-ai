export const radius = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const fontSize = {
  micro: ["0.6875rem", { lineHeight: "1rem", fontWeight: "500" }],
  xs: ["0.75rem", { lineHeight: "1rem" }],
  sm: ["0.875rem", { lineHeight: "1.375rem" }],
  base: ["0.875rem", { lineHeight: "1.4rem" }],
  md: ["1rem", { lineHeight: "1.5rem", fontWeight: "500" }],
  lg: ["1.125rem", { lineHeight: "1.625rem", fontWeight: "500" }],
  xl: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "500" }],
  metric: ["1.625rem", { lineHeight: "2rem", fontWeight: "500" }],
} as const;

export const zIndex = {
  base: "0",
  dropdown: "10",
  sticky: "20",
  overlay: "40",
  modal: "50",
  toast: "60",
} as const;

export const motion = {
  duration: {
    fast: "120ms",
    normal: "180ms",
    slow: "240ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1.2)",
  },
} as const;

export const chartColors = [
  "#1D9E75",
  "#534AB7",
  "#D85A30",
  "#BA7517",
  "#378ADD",
  "#888780",
] as const;

export const categoryColors = {
  alimentacao: "#1D9E75",
  moradia: "#534AB7",
  transporte: "#D85A30",
  assinaturas: "#BA7517",
  saude: "#378ADD",
  lazer: "#D4537E",
  outros: "#888780",
} as const;

export type ChartColor = (typeof chartColors)[number];
export type CategoryColorKey = keyof typeof categoryColors;
