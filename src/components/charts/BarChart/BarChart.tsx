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

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

// Since we use custom shape (not fill prop), entry.color isn't set by Recharts.
// Map dataKey → color explicitly for the tooltip dots.
const SERIES_COLORS: Record<string, string> = {
  receitas: CHART_COLORS.success,
  despesas: CHART_COLORS.danger,
};

type BarChartProps = {
  data: BarDataPoint[];
  height?: number;
  labelFormatter?: (month: string) => string;
  "aria-label": string;
};

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

function BarChart({
  data,
  height = 240,
  labelFormatter,
  "aria-label": ariaLabel,
}: BarChartProps) {
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
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel, fontFamily: MONO }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={(props) => {
              if (!props.active || !props.payload?.length) return null;
              const month = String(props.label ?? "");
              const header = labelFormatter ? labelFormatter(month) : month;

              return (
                <div
                  className="rounded-lg px-3 py-2.5 text-xs shadow-pop"
                  style={{ background: "hsl(240, 10%, 12%)", color: "#fff" }}
                >
                  <p className="mb-2 font-semibold">{header}</p>
                  <div className="space-y-1.5">
                    {props.payload.map((entry) => {
                      const key = String(entry.name ?? "");
                      const color = SERIES_COLORS[key] ?? "#fff";
                      const value = typeof entry.value === "number" ? entry.value : 0;

                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ background: color }}
                          />
                          <span
                            className="tabular-nums"
                            style={{ fontFamily: MONO }}
                          >
                            R$ {value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
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
