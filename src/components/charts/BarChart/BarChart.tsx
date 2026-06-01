"use client";

import { useState } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { BarDataPoint } from "@/features/dashboard/types/dashboard.types";
import { CHART_COLORS } from "@/lib/chart-colors";

type BarChartProps = {
  data: BarDataPoint[];
  height?: number;
  "aria-label": string;
};

// BarShapeProps subset — contravariant with Recharts' BarShapeProps so the
// function is assignable to ActiveShape<BarShapeProps, SVGPathElement>.
type BarRect = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
};

function makeBarShape(fill: string, activeIndex: number | undefined) {
  return ({ x = 0, y = 0, width = 0, height = 0, index }: BarRect) => {
    const isInactive = activeIndex !== undefined && activeIndex !== index;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(0, height)}
        fill={fill}
        fillOpacity={isInactive ? 0.3 : 1}
        rx={3}
        style={{ transition: "fill-opacity 150ms" }}
      />
    );
  };
}

function BarChart({ data, height = 240, "aria-label": ariaLabel }: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
          barCategoryGap="35%"
          barGap={3}
          onMouseMove={(state) => {
            const idx = (state as { activeTooltipIndex?: number }).activeTooltipIndex;
            setActiveIndex(typeof idx === "number" ? idx : undefined);
          }}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.5rem",
              border: `1px solid ${CHART_COLORS.grid}`,
              fontSize: 12,
            }}
            cursor={{ fill: "transparent" }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : 0;
              return [
                `R$ ${n.toLocaleString("pt-BR")}`,
                name === "receitas" ? "Receitas" : "Despesas",
              ];
            }}
          />
          <Bar
            dataKey="receitas"
            maxBarSize={20}
            shape={makeBarShape(CHART_COLORS.success, activeIndex)}
          />
          <Bar
            dataKey="despesas"
            maxBarSize={20}
            shape={makeBarShape(CHART_COLORS.danger, activeIndex)}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { BarChart };
