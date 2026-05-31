import { describe, expect, it } from "vitest";

import { categoryColors, chartColors, motion, radius } from "@/styles/tokens";

describe("design tokens", () => {
  it("keeps the brand purple reserved in the chart sequence", () => {
    expect(chartColors).toContain("#534AB7");
  });

  it("defines stable financial category colors", () => {
    expect(categoryColors).toMatchObject({
      alimentacao: "#1D9E75",
      moradia: "#534AB7",
      transporte: "#D85A30",
      assinaturas: "#BA7517",
      saude: "#378ADD",
      lazer: "#D4537E",
      outros: "#888780",
    });
  });

  it("exposes shared radius and motion scales", () => {
    expect(radius.lg).toBe("0.75rem");
    expect(motion.duration.normal).toBe("180ms");
  });
});
